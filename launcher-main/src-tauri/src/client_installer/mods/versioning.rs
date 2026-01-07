use std::fs;

use super::super::ClientInstaller;

impl ClientInstaller {
    pub fn get_current_version(&self) -> Option<String> {
        let version_file = self.base_dir.join("client-version.txt");
        if version_file.exists() {
            fs::read_to_string(version_file).ok().map(|s| s.trim().to_string())
        } else {
            None
        }
    }

    pub fn get_installed_client_version(&self) -> Option<String> {
        // Ищем файл Boolean Client в папке модов
        if let Ok(entries) = fs::read_dir(&self.mods_dir) {
            for entry in entries.flatten() {
                let file_name = entry.file_name();
                let name = file_name.to_string_lossy();

                if name.to_lowercase().contains("boolean")
                    || name.to_lowercase().contains("shakedown")
                    || name.to_lowercase().contains("arizon")
                    || name.to_lowercase().contains("exosware")
                {
                    // Пытаемся извлечь версию из имени файла
                    // Формат: boolean-client-1.0.0.jar или BooleanClient-v1.0.0.jar
                    if let Some(version) = self.extract_version_from_filename(&name) {
                        return Some(version);
                    }
                }
            }
        }

        // Если не нашли в имени файла, проверяем сохраненную версию
        self.get_current_version()
    }

    fn extract_version_from_filename(&self, filename: &str) -> Option<String> {
        // Пытаемся найти паттерн версии: v1.0.0 или 1.0.0
        let re = regex::Regex::new(r"v?(\d+\.\d+\.\d+)").ok()?;
        re.captures(filename)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str().to_string())
    }
}
