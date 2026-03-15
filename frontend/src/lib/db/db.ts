import { Pool, QueryResult, type QueryResultRow } from "pg";

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
});

const query = async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> => {
    return pool.query<T>(text, params);
};

export default query;