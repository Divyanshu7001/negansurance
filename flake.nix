{
  description = "Negansurance development environment with Postgres services";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    flake-parts.url = "github:hercules-ci/flake-parts";

    systems.url = "github:nix-systems/default";

    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";

    services-flake.url = "github:juspay/services-flake";
  };

  outputs = inputs@{ self, flake-parts, ... }:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import inputs.systems;

      imports = [ inputs.process-compose-flake.flakeModule ];

      perSystem = { self', pkgs, lib, config, ... }:
        let
          linuxPythonEnv =
            lib.optionalAttrs pkgs.stdenv.isLinux {
              LD_LIBRARY_PATH = lib.makeLibraryPath pkgs.pythonManylinuxPackages.manylinux1;
            };
        in
        {
          process-compose."postgres-stack" = { config, ... }:
            let
              dbName = "negansurance";
            in
            {
              imports = [
                inputs.services-flake.processComposeModules.default
              ];

              services.postgres.pg1 = {
                enable = true;
                initialDatabases = [
                  {
                    name = dbName;
                  }
                ];
              };

              settings.processes.pgweb =
                let
                  pgcfg = config.services.postgres.pg1;
                in
                {
                  environment.PGWEB_DATABASE_URL = pgcfg.connectionURI { inherit dbName; };
                  command = pkgs.pgweb;
                  depends_on.pg1.condition = "process_healthy";
                };
            };

          packages.default = self'.packages."postgres-stack";

          devShells.default = pkgs.mkShell {
            inputsFrom = [
              config.process-compose."postgres-stack".services.outputs.devShell
            ];
            packages = [
              pkgs.python3
              pkgs.basedpyright
              pkgs.ruff
              pkgs.uv
              self'.packages."postgres-stack"
            ];
            env = linuxPythonEnv;
            shellHook = ''
              unset PYTHONPATH
              uv sync
              . .venv/bin/activate
            '';
          };
        };
    };
}
