module.exports = {
  apps: [
    {
      name: "main",
      script: "public/js/main.js",
      exec_mode: "cluster",
      instances: 1,
      /* log_file: "/main_output.log",
      error_file: "/main_error.log", */
      node_args: "--max_old_space_size=8192",
    },
    {
      name: "app",
      script: "src/app.js",
      exec_mode: "cluster",
      instances: 1,
      /* log_file: "/app_output.log",
      error_file: "/app_error.log", */
      node_args: "--max_old_space_size=8192",
    },
    {
      name: "pm2",
      script: "src/pm2Lib.js",
      exec_mode: "cluster",
      instances: 1,
      /* log_file: "/pm2_output.log",
      error_file: "/pm2_error.log", */
      node_args: "--max_old_space_size=8192",
    },
    {
      name: "socket",
      script: "src/socketIO.js",
      exec_mode: "cluster",
      instances: 1,
      /* log_file: "/socket_output.log",
      error_file: "/socket_error.log", */
      node_args: "--max_old_space_size=8192",
    },
    {
      name: "starter",
      script: "src/starter.js",
      exec_mode: "cluster",
      instances: 1,
      /* log_file: "/socket_output.log",
      error_file: "/socket_error.log", */
      node_args: "--max_old_space_size=8192",
    }, 
  ]
};
