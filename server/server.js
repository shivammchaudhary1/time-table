import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import connectDB from './config/db.js';
import envs from './config/envs.js';
import { appRoutes } from './routes/app.route.js';

const app = express();

// ========== Middleware ==========
app.use(cors());
app.use(express.json());
// ========== Routes ==========
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Time Table API!',
    time: new Date().toISOString(),
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  });
});

appRoutes(app);

// ========== Start Server ==========
app.listen(envs.port, async () => {
  // ========== Database Connection ==========
  await connectDB();
  console.log(chalk.green.bold(`\n🚀 Server started successfully!`));
  console.log(chalk.blue(`   Environment: ${envs.node_env}`));
  console.log(chalk.blue(`   Port: ${envs.port}`));
  console.log(chalk.blue(`   URL: http://localhost:${envs.port}\n`));
});
