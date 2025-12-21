import baseConfig from "@page-builder/config-tsup/base";
import { defineConfig } from "tsup";

export default defineConfig({
    ...baseConfig,
    external: ["@prisma/client", "../generated/client", "./generated/client"],
    noExternal: []
});
