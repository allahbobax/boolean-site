use anyhow::{Context, Result};

use super::{ApiResponse, ClientInstaller, VersionInfo, SERVER_URL};

impl ClientInstaller {
    pub async fn get_latest_version(&self, user_id: Option<i32>) -> Result<VersionInfo> {
        let url = if let Some(uid) = user_id {
            format!("{}/api/client/version?userId={}", SERVER_URL, uid)
        } else {
            format!("{}/api/client/version", SERVER_URL)
        };

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .context("Не удалось подключиться к серверу")?;

        let status = response.status();

        let response_text = response
            .text()
            .await
            .context("Не удалось прочитать ответ сервера")?;

        let api_response: ApiResponse = serde_json::from_str(&response_text).context(format!(
            "Ошибка декодирования ответа сервера. Статус: {}, Ответ: {}",
            status, response_text
        ))?;

        if !api_response.success {
            let error_msg = api_response
                .message
                .unwrap_or_else(|| "Неизвестная ошибка".to_string());
            return Err(anyhow::anyhow!("Ошибка сервера: {}", error_msg));
        }

        let version_info = api_response
            .data
            .context("Версия клиента не найдена в ответе сервера")?;

        Ok(version_info)
    }
}
