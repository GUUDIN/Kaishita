import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { addClient } from "~/.server/initializers/communication";

export const meta: MetaFunction = () => {
  return [
    { title: "Index" },
    { name: "description", content: "Getting client" },
  ];
};

export const loader: LoaderFunction = async () => {
  const clientId = addClient();
  return redirect(`/kaishita?clientId=${clientId}`);
};

export default function Index() {
  return (
    <div style={styles.container}>
      <h1>Loading client...</h1>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  }
}