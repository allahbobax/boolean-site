use std::fs;
use std::path::PathBuf;

use tauri::{AppHandle, Emitter, Runtime};

use super::types::LogEvent;

/// Исправление GUI scale в options.txt
pub fn fix_gui_scale<R: Runtime>(launch_dir: &PathBuf, app: &AppHandle<R>) -> std::io::Result<()> {
    let run_dir = launch_dir.join("run");
    let options_path = run_dir.join("options.txt");

    // Создаём директорию run если её нет
    if !run_dir.exists() {
        fs::create_dir_all(&run_dir)?;
    }

    if options_path.exists() {
        let content = fs::read_to_string(&options_path)?;

        // Проверяем, нужно ли исправлять guiScale
        // Если guiScale:0 (Auto) или отсутствует, ставим 2 (Normal)
        if !content.contains("guiScale:2") {
            let new_content = if content.contains("guiScale:") {
                content
                    .lines()
                    .map(|line| {
                        if line.starts_with("guiScale:") {
                            "guiScale:2".to_string()
                        } else {
                            line.to_string()
                        }
                    })
                    .collect::<Vec<_>>()
                    .join("\n")
            } else {
                format!("{}\nguiScale:2", content)
            };

            fs::write(&options_path, new_content)?;
            let _ = app.emit(
                "minecraft-log",
                LogEvent {
                    message: "GUI scale fixed to Normal (2)".into(),
                },
            );
        }
    } else {
        // Файл не существует — создаём с правильным guiScale
        // Minecraft перезапишет остальные настройки, но guiScale останется
        fs::write(&options_path, "guiScale:2\n")?;
        let _ = app.emit(
            "minecraft-log",
            LogEvent {
                message: "Created options.txt with GUI scale Normal (2)".into(),
            },
        );
    }

    Ok(())
}
