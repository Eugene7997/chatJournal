export default function NavbarProfile({ src }: { src: string}) {
    return (
        <div className="h-8 w-8">
            <img 
                className="rounded-full w-full h-full object-cover"
                src={src}
                alt="Profile"
            />
        </div>
    )
}