use std::fs;
use std::path::{Path, PathBuf};

use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};

const SERVER_URL: &str = "https://booleanclient.online";
const LAUNCH_ZIP_URL: &str = "https://github.com/zxctehas1337/1/releases/download/Beta/launch.zip";
const FABRIC_API_URL: &str = "https://cdn.modrinth.com/data/P7dR8mSH/versions/KEv54FjE/fabric-api-0.111.0%2B1.21.4.jar";
const FABRIC_API_VERSION: &str = "0.111.0+1.21.4";
const SODIUM_URL: &str = "https://cdn.modrinth.com/data/AANobbMI/versions/c3YkZvne/sodium-fabric-0.6.13%2Bmc1.21.4.jar";
const SODIUM_VERSION: &str = "0.6.13+mc1.21.4";

mod download;
mod version;
mod mods;
mod launch;
mod java;

#[derive(Serialize, Clone)]
pub struct InstallProgress {
    pub stage: String,
    pub progress: f64,
    pub message: String,
}

#[derive(Deserialize, Debug)]
pub struct VersionInfo {
    pub version: String,
    #[serde(alias = "downloadUrl", alias = "download_url")]
    pub download_url: String,
    pub changelog: Option<String>,
    #[serde(alias = "updatedAt", alias = "updated_at")]
    pub updated_at: Option<String>,
}

#[derive(Deserialize, Debug)]
struct ApiResponse {
    success: bool,
    data: Option<VersionInfo>,
    message: Option<String>,
}

pub struct ClientInstaller {
    /// Базовая директория для метаданных (версии и т.д.)
    base_dir: PathBuf,
    /// Директория для launch файлов (Minecraft runtime)
    launch_dir: PathBuf,
    /// Директория для обычных модов (Fabric API, Sodium)
    mods_dir: PathBuf,
    /// Скрытая директория для JAR чита
    hidden_client_dir: PathBuf,
    client: Client,
}

impl ClientInstaller {
    /// Создаёт инсталлер с путём из настроек пользователя
    pub fn new_with_path(base_dir: PathBuf, user_install_path: Option<String>) -> Self {
        // Определяем путь для Minecraft файлов
        let user_dir = match user_install_path {
            Some(path) if !path.is_empty() => PathBuf::from(path),
            _ => base_dir.clone(),
        };
        
        let launch_dir = user_dir.join("launch");
        // Обычные моды в папке пользователя
        let mods_dir = launch_dir.join("run").join("mods");
        
        // Скрытая директория для JAR чита в %LOCALAPPDATA%Low\Microsoft
        let hidden_client_dir = Self::get_hidden_client_dir();
        
        Self {
            base_dir,
            launch_dir,
            mods_dir,
            hidden_client_dir,
            client: Client::new(),
        }
    }
    
    /// Создаёт инсталлер с дефолтным путём (для обратной совместимости)
    pub fn new(base_dir: PathBuf) -> Self {
        Self::new_with_path(base_dir, None)
    }
    
    /// Возвращает скрытую директорию для JAR чита
    fn get_hidden_client_dir() -> PathBuf {
        #[cfg(target_os = "windows")]
        {
            // %LOCALAPPDATA%Low\Microsoft - выглядит как системная папка
            if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
                let localappdata_path = PathBuf::from(local_app_data);
                // LocalAppDataLow находится рядом с LocalAppData
                let localappdata_low = localappdata_path.parent()
                    .map(|p| p.join("LocalLow"))
                    .unwrap_or_else(|| PathBuf::from("C:\\Users\\Default\\AppData\\LocalLow"));
                return localappdata_low.join("Microsoft").join("CrashDump").join("cache");
            }
            PathBuf::from("C:\\Users\\Default\\AppData\\LocalLow\\Microsoft\\CrashDump\\cache")
        }
        
        #[cfg(not(target_os = "windows"))]
        {
            // На Linux/Mac используем скрытую папку в home
            if let Ok(home) = std::env::var("HOME") {
                return PathBuf::from(home).join(".cache").join(".system").join("crash");
            }
            PathBuf::from("/tmp/.system/crash")
        }
    }

    pub fn get_mods_dir(&self) -> &Path {
        &self.mods_dir
    }
    
    pub fn get_hidden_client_dir_path(&self) -> &Path {
        &self.hidden_client_dir
    }
    
    pub fn get_launch_dir(&self) -> &Path {
        &self.launch_dir
    }

    pub fn ensure_directories(&self) -> Result<()> {
        fs::create_dir_all(&self.base_dir)?;
        fs::create_dir_all(&self.launch_dir)?;
        fs::create_dir_all(&self.mods_dir)?;
        fs::create_dir_all(&self.hidden_client_dir)?;
        Ok(())
    }
}