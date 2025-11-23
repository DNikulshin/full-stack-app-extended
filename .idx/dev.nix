# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.openssl
    pkgs.openssl_3
    pkgs.docker-compose

  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      "google.gemini-cli-vscode-ide-companion"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        frontend-install = "cd frontend && npm install";
        backend-install = "cd backend && npm install";
      };
      # Runs on every workspace startup
      onStart = {
        # Command to start docker-compose
        docker = "cd backend && docker-compose up -d";
        # El comando para iniciar el backend
        backend = "cd backend && npm run start:dev";
        # El comando para iniciar el frontend
        frontend = "cd frontend && npm run dev";
              # El comando para iniciar el prisma-studio
        prisma-studio = "cd backend && npm run prisma:studio:dev";
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["sh" "-c" "cd frontend && npm run dev -- --port $PORT --host 0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
    services.docker.enable = true;
}
