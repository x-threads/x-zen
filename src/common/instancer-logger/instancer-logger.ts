import chalk from "chalk";

export const LogInstancer = (context: string, module: any) => {
  const log = console.log;
  const timestamp = new Date().toLocaleString();
  log(
    chalk.blue(`${timestamp} -`),
    chalk.magenta(`[${context}] - ${module?.name || module}`)
  );
};
