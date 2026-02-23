module.exports = {
  apps: [
    {
      name: "kubsy-admin",
      cwd: "/root/my-app/kubsy/admin/admin-panel",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: "kubsy-api",
      cwd: "/root/my-app/kubsy/datting",
      script: "dist/index.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
