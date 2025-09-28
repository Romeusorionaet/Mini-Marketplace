import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: process.env.HOST_ELASTICSEARCH,
});
