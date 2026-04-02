import Image from "next/image";

export default function NavbarProfile({ src }: { src: string}) {
    return (
        <div className="h-8 w-8">
            <Image 
                src={src}
                width={100}
                height={100}
                className="rounded-full w-full h-full object-cover"
                alt="Profile"
            />
        </div>
    )
}