interface Build {
    platform: string;
    name: string;
    download: string;
}

interface Version {
    steel_version: string;
    mc_version: string;
    released_at: string;
    builds: Build[];
}

type Versions = Version[];

let cachedData: Versions | null = null;

const fallbackVersions: Versions = [
    {
        steel_version: "0.1.0",
        mc_version: "26.2",
        released_at: "2026-07-28T00:00:00Z",
        builds: [
            {
                platform: "x86_64-unknown-linux-gnu",
                name: "steel-x86_64-unknown-linux-gnu",
                download: "https://github.com/Steel-Foundation/SteelMC/releases",
            },
            {
                platform: "x86_64-pc-windows-msvc",
                name: "steel-x86_64-pc-windows-msvc.exe",
                download: "https://github.com/Steel-Foundation/SteelMC/releases",
            },
            {
                platform: "aarch64-apple-darwin",
                name: "steel-aarch64-apple-darwin",
                download: "https://github.com/Steel-Foundation/SteelMC/releases",
            },
        ],
    },
];

export async function getVersions(): Promise<Versions> {
    if (cachedData) return cachedData;

    try {
        const response = await fetch(
            "https://api.github.com/repos/Steel-Foundation/SteelMC/releases",
            {
                headers: {
                    "User-Agent": "SteelDocs-Builder",
                },
            }
        );
        if (!response.ok) {
            console.warn(`GitHub releases API returned ${response.status}, using fallback version data`);
            cachedData = fallbackVersions;
            return cachedData;
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            console.warn("GitHub releases API did not return an array, using fallback version data");
            cachedData = fallbackVersions;
            return cachedData;
        }
        cachedData = data
            .map((ver: { tag_name: string, published_at: string, assets: [{ name: string, browser_download_url: string }] }) => {
                var parsed_version = ver.tag_name.match(/v(.*)\+mc(.*)/);
                if (parsed_version == null) return;
                return {
                    steel_version: parsed_version[1],
                    mc_version: parsed_version[2],
                    released_at: ver.published_at,
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

        if (cachedData.length === 0) {
            cachedData = fallbackVersions;
        }
        return cachedData as Versions;
    } catch (e) {
        console.warn("Failed to fetch releases from GitHub API, using fallback version data", e);
        cachedData = fallbackVersions;
        return cachedData;
    }
}
export async function steelVersion() {
    var versions = await getVersions();
    return versions[0]?.steel_version || "0.1.0";
}
export async function mcVersion() {
    var versions = await getVersions();
    return versions[0]?.mc_version || "26.2";
}
