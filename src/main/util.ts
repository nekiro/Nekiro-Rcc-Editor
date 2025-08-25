import { arch } from "os";

export enum PlatformType {
	x64 = "x64",
	x86 = "x86",
}

export const getPlatformType = (): PlatformType => {
	// First try from environment variable (Windows specific)
	const envArch =
		process.env.PROCESSOR_ARCHITEW6432 || process.env.PROCESSOR_ARCHITECTURE;

	if (envArch) {
		// If environment variable contains x64, it's 64-bit
		if (envArch.includes("64")) {
			return PlatformType.x64;
		} else {
			return PlatformType.x86;
		}
	}

	// Fallback to Node.js os.arch() which is more reliable
	const nodeArch = arch();

	if (nodeArch === "x64" || nodeArch === "arm64") {
		return PlatformType.x64;
	} else {
		return PlatformType.x86;
	}
};
