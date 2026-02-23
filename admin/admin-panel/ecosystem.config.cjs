module.exports = {
  apps: [
    {
      name: "kubsy-admin",
      cwd: "/root/my-app/kubsy/admin/admin-panel",
      script: "node_modules/.bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
