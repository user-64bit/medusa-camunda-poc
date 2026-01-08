import { medusa } from "./medusa";
import { cookies } from "next/headers";

const AUTH_TOKEN_KEY = "medusa_auth_token";

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_KEY)?.value;
}

export async function setAuthToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_KEY);
}

export async function getCustomer() {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const { customer } = await medusa.store.customer.retrieve(
      {},
      { Authorization: `Bearer ${token}` }
    );
    return customer;
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return null;
  }
}

export async function login(email: string, password: string) {
  try {
    const result = await medusa.auth.login("customer", "emailpass", {
      email,
      password,
    });
    
    // Result can be a token string or { location: string } for OAuth redirects
    if (typeof result === "string") {
      await setAuthToken(result);
      return { success: true };
    }
    
    return { success: false, error: "Login failed" };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Login failed" 
    };
  }
}

export async function register(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) {
  try {
    // First, register the auth identity
    const result = await medusa.auth.register("customer", "emailpass", {
      email: data.email,
      password: data.password,
    });

    // Result can be a token string or { location: string } for OAuth redirects
    if (typeof result === "string") {
      await setAuthToken(result);
      
      // Then create the customer profile
      await medusa.store.customer.create(
        {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        },
        {},
        { Authorization: `Bearer ${result}` }
      );
      
      return { success: true };
    }
    
    return { success: false, error: "Registration failed" };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Registration failed" 
    };
  }
}

export async function logout() {
  await clearAuthToken();
}
