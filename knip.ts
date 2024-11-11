import type { KnipConfig } from "knip";

type KnipWorkspaceConfig = NonNullable<KnipConfig["workspaces"]>[string];

type KnipTransformer = (config: KnipWorkspaceConfig) => KnipWorkspaceConfig;

function defineWorkspace({ ignore, ...config }: KnipWorkspaceConfig, transformers?: KnipTransformer[]): KnipWorkspaceConfig {
    let transformedConfig: KnipWorkspaceConfig = {
        ...config,
        ignore: [
            ...(ignore as string[] ?? []),
            "node_modules/**",
            "dist/**"
        ]
    };

    if (transformers) {
        transformedConfig = transformers.reduce((acc, transformer) => transformer(acc), transformedConfig);
    }

    return transformedConfig;
}

const configureLib: KnipTransformer = config => {
    return {
        ...config,
        eslint: true,
        tsup: {
            config: ["tsup.*.ts"]
        }
    };
};

const rootConfig: KnipWorkspaceConfig = defineWorkspace({
    ignoreDependencies: [
        "ts-node"
    ]
});

const libConfig: KnipWorkspaceConfig = defineWorkspace({}, [
    configureLib
]);

const config: KnipConfig = {
    workspaces: {
        ".": rootConfig,
        "lib": libConfig
    },
    // Temporary ignoring
    ignoreWorkspaces: [
        "sample/**"
    ],
    exclude: [
        // It cause issues with config like Jest "projects".
        "unresolved"
    ],
    ignoreExportsUsedInFile: true
};

export default config;
