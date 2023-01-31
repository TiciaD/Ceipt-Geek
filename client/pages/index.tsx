import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Card from "@mui/material/Card";
import { Button, CardActions, CardContent, Typography } from "@mui/material";
import Link from "next/link";
import DarkModeSwitch from "../components/DarkModeSwitch";

type HomeProps = {
  toggleTheme: React.MouseEventHandler<HTMLButtonElement>;
};

export default function Home(props: HomeProps) {
  return (
    <div>
      <Head>
        <title>Receipt Tracker - Home</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Card sx={{ minWidth: 275, padding: "2rem" }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
              Welcome to Receipt Tracker
            </Typography>
            <Typography>
              Stay on track with your expenses by storing and organizing your
              receipt information
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" size="small">
              <Link href="/login">LOGIN</Link>
            </Button>
            <Button variant="contained" size="small">
              CREATE AN ACCOUNT
            </Button>
            <DarkModeSwitch toggleTheme={props.toggleTheme} />
          </CardActions>
        </Card>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
