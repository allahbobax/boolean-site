use std::fs;
use std::path::PathBuf;

use serde_json::Value;

const VERSION_MANIFEST_URL: &str = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";

/// Поиск установленной версии в папке versions
pub fn find_installed_version_id(launch_dir: &PathBuf) -> Option<String> {
    let versions_dir = launch_dir.join("versions");
    let entries = fs::read_dir(&versions_dir).ok()?;

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let version_id = entry.file_name().to_string_lossy().to_string();
        let json_path = path.join(format!("{version_id}.json"));
        let jar_path = path.join(format!("{version_id}.jar"));
        if json_path.exists() && jar_path.exists() {
            return Some(version_id);
        }
    }

    None
}

/// Загрузка и мерж version.json с родительским (inheritsFrom)
pub fn load_effective_version_json(
    launch_dir: &PathBuf,
    version_id: &str,
) -> anyhow::Result<Value> {
    let version_dir = launch_dir.join("versions").join(version_id);
    let version_json_path = version_dir.join(format!("{version_id}.json"));

    let version_json_raw = fs::read_to_string(&version_json_path)?;
    let version_json: Value = serde_json::from_str(&version_json_raw)?;

    let mut effective_version_json = version_json.clone();

    if let Some(parent_id) = version_json.get("inheritsFrom").and_then(|v| v.as_str()) {
        let parent_dir = launch_dir.join("versions").join(parent_id);
        let parent_json_path = parent_dir.join(format!("{parent_id}.json"));
        
        // Если родительский JSON не существует, пробуем скачать
        if !parent_json_path.exists() {
            if let Err(_e) = download_vanilla_version_json_sync(parent_id, &parent_dir) {
                // Failed to download parent JSON
            }
        }
        
        if parent_json_path.exists() {
            let parent_raw = fs::read_to_string(&parent_json_path)?;
            let parent_json: Value = serde_json::from_str(&parent_raw)?;

            // Мерж библиотек
            let mut merged_libs: Vec<Value> = Vec::new();
            if let Some(parent_libs) = parent_json.get("libraries").and_then(|v| v.as_array()) {
                merged_libs.extend(parent_libs.iter().cloned());
            }
            if let Some(child_libs) = version_json.get("libraries").and_then(|v| v.as_array()) {
                merged_libs.extend(child_libs.iter().cloned());
            }
            if !merged_libs.is_empty() {
                effective_version_json["libraries"] = Value::Array(merged_libs);
            } else if let Some(parent_libs) = parent_json.get("libraries") {
                effective_version_json["libraries"] = parent_libs.clone();
            }

            // Наследование assetIndex
            if effective_version_json.get("assetIndex").is_none() {
                if let Some(parent_ai) = parent_json.get("assetIndex") {
                    effective_version_json["assetIndex"] = parent_ai.clone();
                }
            }

            // Наследование mainClass
            if effective_version_json.get("mainClass").is_none() {
                if let Some(parent_mc) = parent_json.get("mainClass") {
                    effective_version_json["mainClass"] = parent_mc.clone();
                }
            }
            
            // Merge complete
        } else {
            // Parent JSON not found, libraries from vanilla will be missing
        }
    }

    Ok(effective_version_json)
}

/// Извлечение asset index ID из version.json
pub fn get_asset_index_id(version_json: &Value) -> String {
    version_json
        .get("assetIndex")
        .and_then(|v| v.get("id"))
        .and_then(|v| v.as_str())
        .unwrap_or("19")
        .to_string()
}

/// Извлечение main class из version.json
pub fn get_main_class(version_json: &Value) -> String {
    version_json
        .get("mainClass")
        .and_then(|v| v.as_str())
        .unwrap_or("net.fabricmc.loader.impl.launch.knot.KnotClient")
        .to_string()
}

/// Синхронное скачивание vanilla version JSON
fn download_vanilla_version_json_sync(version_id: &str, target_dir: &PathBuf) -> anyhow::Result<()> {
    use std::io::Write;
    
    // Скачиваем манифест версий
    let manifest_response = reqwest::blocking::get(VERSION_MANIFEST_URL)?;
    let manifest: Value = manifest_response.json()?;
    
    // Ищем нужную версию
    let versions = manifest
        .get("versions")
        .and_then(|v| v.as_array())
        .ok_or_else(|| anyhow::anyhow!("No versions array in manifest"))?;
    
    let version_entry = versions
        .iter()
        .find(|v| v.get("id").and_then(|id| id.as_str()) == Some(version_id))
        .ok_or_else(|| anyhow::anyhow!("Version {} not found in manifest", version_id))?;
    
    let version_url = version_entry
        .get("url")
        .and_then(|u| u.as_str())
        .ok_or_else(|| anyhow::anyhow!("No URL for version {}", version_id))?;
    
    // Скачиваем JSON версии
    let version_response = reqwest::blocking::get(version_url)?;
    let version_json_content = version_response.text()?;
    
    // Создаём директорию и сохраняем файл
    fs::create_dir_all(target_dir)?;
    let json_path = target_dir.join(format!("{}.json", version_id));
    
    let mut file = fs::File::create(&json_path)?;
    file.write_all(version_json_content.as_bytes())?;
    
    Ok(())
}
