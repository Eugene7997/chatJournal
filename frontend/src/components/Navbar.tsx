export default function Navbar() {
    return (
        <header>
            <div className="flex items-center justify-between p-4">
                <img src="/logo.svg" alt="ChatJournal logo" className="h-8 w-8" />
                <nav className="flex justify-center gap-8">
                    <a href="/">Home</a>
                    <a href="/about">About</a>
                    <a href="/login">Login or Sign up</a>
                </nav>
            </div>
        </header>
    );
}