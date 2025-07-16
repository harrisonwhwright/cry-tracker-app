import Link from 'next/link';

export default function LandingPage() {
    return (
        <div style={{ maxWidth: '600px', margin: '150px auto', padding: '20px', textAlign: 'center' }}>
            <h1>Welcome to Cry-Tracker</h1>
            <p>A place to share... privately.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
                <Link href="/signup" style={{ padding: '10px 20px', border: '1px solid black', textDecoration: 'none' }}>
                    Sign Up
                </Link>
                <Link href="/login" style={{ padding: '10px 20px', border: '1px solid black', textDecoration: 'none' }}>
                    Login
                </Link>
            </div>
        </div>
    );
}
