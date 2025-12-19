import baseConfig from "@page-builder/config-eslint/base";

export default [
	...baseConfig,
	{
		ignores: ["**/*.test.ts", "**/*.test.tsx", "**/vitest.config.ts", "**/vitest.setup.ts"]
	}
];
