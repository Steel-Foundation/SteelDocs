type Versions = [{
    steel_version: string,
    mc_version: string,
    builds: [{
        platform: string,
        name: string,
        download: string,
    }]
}]

let cachedData: Versions | null = null;

export async function getVersions(): Promise<Versions> {
    if (cachedData) return cachedData;

    const data = await fetch(
        "https://api.github.com/repos/Steel-Foundation/SteelMC/releases",
    ).then((response) => response.json());
    cachedData = data
        .map((ver: { tag_name: string, assets: [{ name: string, browser_download_url: string }] }) => {
            var parsed_version = ver.tag_name.match(/v(.*)\+mc(.*)/);
            if (parsed_version == null) return;
            return {
                steel_version: parsed_version[1],
                mc_version: parsed_version[2],
                builds: ver.assets.map((asset) => {
                    return {
                        platform: asset.name
                            .replace("steel-", "")
                            .replace(".exe", ""),
                        name: asset.name,
                        download: asset.browser_download_url,
                    };
                }),
            };
        })
        .filter((ver: {} | null) => ver != null);
    return cachedData as Versions;
}
export async function steelVersion() {
    var versions = await getVersions();
    return versions[0].steel_version
}
export async function mcVersion() {
    var versions = await getVersions();
    return versions[0].mc_version
}