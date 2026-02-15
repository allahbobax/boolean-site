use tauri::{AppHandle, Emitter, Runtime, State};
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::sync::Mutex;
use serde::Serialize;

use super::templates;

pub struct AuthState {
    pub server_stop_tx: Mutex<Option<tokio::sync::oneshot::Sender<()>>>,
}

#[derive(Serialize, Clone)]
struct OAuthCallbackPayload {
    token: Option<String>,
    #[serde(rename = "userData")]
    user_data: Option<String>,
}

pub async fn start_oauth_server<R: Runtime>(app: AppHandle<R>, state: State<'_, AuthState>) -> Result<serde_json::Value, String> {
    // Check if server is already running and stop it
    {
        let mut stop_tx_guard = state.server_stop_tx.lock().unwrap();
        if stop_tx_guard.is_some() {
            if let Some(tx) = stop_tx_guard.take() {
                let _ = tx.send(());
            }
        }
    }

    // Bind to port 0 to let OS choose a free port
    let listener = TcpListener::bind("127.0.0.1:0").await.map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();

    let (tx, mut rx) = tokio::sync::oneshot::channel();
    {
        let mut stop_tx_guard = state.server_stop_tx.lock().unwrap();
        *stop_tx_guard = Some(tx);
    }

    let app_clone = app.clone();
    
    tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = &mut rx => {
                    break;
                }
                Ok((mut socket, _)) = listener.accept() => {
                    let app = app_clone.clone();
                    tokio::spawn(async move {
                        handle_connection(&mut socket, &app).await;
                    });
                }
            }
        }
    });

    Ok(serde_json::json!({ "success": true, "port": port }))
}

async fn handle_connection<R: Runtime>(socket: &mut tokio::net::TcpStream, app: &AppHandle<R>) {
    let mut buf = vec![0u8; 131072]; // 128KB buffer для больших OAuth ответов
    let n = match socket.read(&mut buf).await {
        Ok(n) if n == 0 => return,
        Ok(n) => n,
        Err(_) => return,
    };

    let request = String::from_utf8_lossy(&buf[..n]);
    let Some(line) = request.lines().next() else { return };
    
    let url_part = line.split_whitespace().nth(1).unwrap_or("");
    
    // Обрабатываем как /callback так и /api/oauth (для GitHub OAuth)
    let is_callback = line.starts_with("GET /callback");
    let is_oauth_callback = url_part.starts_with("/api/oauth") && url_part.contains("action=callback");
    
    if !is_callback && !is_oauth_callback {
        let response = "HTTP/1.1 404 Not Found\r\n\r\n";
        let _ = socket.write_all(response.as_bytes()).await;
        return;
    }

    let query_start = url_part.find('?').unwrap_or(url_part.len());
    let query = &url_part[query_start..];
    
    let params = parse_query_params(query);

    // Если это OAuth callback от GitHub с code, обмениваем на токен через API
    if params.code.is_some() && is_oauth_callback {
        let code_val = params.code.unwrap();
        let provider_val = params.provider.unwrap_or_else(|| "github".to_string());
        let state_val = params.state.unwrap_or_default();
        
        let redirect_url = format!(
            "https://booleanclient.online/api/oauth?provider={}&action=exchange&code={}&source=launcher&state={}",
            provider_val, code_val, state_val
        );
        
        let response = format!("HTTP/1.1 302 Found\r\nLocation: {}\r\n\r\n", redirect_url);
        let _ = socket.write_all(response.as_bytes()).await;
        return;
    }

    // Emit OAuth callback event
    if params.error.is_some() {
        let _ = app.emit("oauth-callback", OAuthCallbackPayload {
            token: None,
            user_data: None,
        });
    } else if params.token.is_some() || params.user_data.is_some() {
        let _ = app.emit("oauth-callback", OAuthCallbackPayload {
            token: params.token,
            user_data: params.user_data,
        });
    } else {
        let _ = app.emit("oauth-callback", OAuthCallbackPayload {
            token: None,
            user_data: None,
        });
    }

    // Send success page
    let response_body = templates::success_page();
    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\n\r\n{}",
        response_body.len(),
        response_body
    );
    let _ = socket.write_all(response.as_bytes()).await;
}

#[derive(Default)]
struct QueryParams {
    token: Option<String>,
    user_data: Option<String>,
    error: Option<String>,
    code: Option<String>,
    provider: Option<String>,
    state: Option<String>,
}

fn parse_query_params(query: &str) -> QueryParams {
    let mut params = QueryParams::default();
    
    if !query.starts_with('?') {
        return params;
    }
    
    for pair in query[1..].split('&') {
        let mut parts = pair.splitn(2, '=');
        if let (Some(key), Some(value)) = (parts.next(), parts.next()) {
            match key {
                "token" => params.token = Some(value.to_string()),
                "user" => params.user_data = Some(value.to_string()),
                "error" => params.error = Some(value.to_string()),
                "code" => params.code = Some(value.to_string()),
                "provider" => params.provider = Some(value.to_string()),
                "state" => params.state = Some(value.to_string()),
                _ => {}
            }
        }
    }
    
    params
}

pub async fn stop_oauth_server(state: State<'_, AuthState>) -> Result<serde_json::Value, String> {
    let mut stop_tx_guard = state.server_stop_tx.lock().unwrap();
    if let Some(tx) = stop_tx_guard.take() {
        let _ = tx.send(());
    }
    Ok(serde_json::json!({ "success": true }))
}
