import { Client } from "@elastic/elasticsearch";
import { env } from "src/env";

export const esClient = new Client({
  node: env.HOST_ELASTICSEARCH,
});
