
export async function getClient (id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`)
    const data = await res.json()
    return data
}

export async function getClients () {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
    const data = await res.json()
    return data
}
    