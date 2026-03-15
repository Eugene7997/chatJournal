import { auth0 } from "@/lib/auth/auth0";

export async function DELETE() {
    const session = await auth0.getSession();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.sub;

    const params = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: `${process.env.AUTH0_M2M_CLIENT_ID}`,
        client_secret: `${process.env.AUTH0_M2M_CLIENT_SECRET}`,
        audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
    });

    try {
        const response = await fetch(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString()
        });
        const data = await response.json();
        if (!data) {
            return new Response("Something is wrong with the data", { status: 500 }); 
        }
        const accessToken = data.access_token;

        const response2 = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
            method: 'DELETE',
            headers: {
                "authorization": `Bearer ${accessToken}`
            },
            redirect: 'follow'
        })
    }
    catch (err) {
        console.log(err);
        return new Response(JSON.stringify("FAILED"), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "successfully deleted" }), { status: 200 });
}