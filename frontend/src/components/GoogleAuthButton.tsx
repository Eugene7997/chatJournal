import type { GoogleButtonProps } from "@/lib/types/types";

export default function GoogleAuthButton({ onClick, disabled = false }: GoogleButtonProps) {

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="w-1/4 bg-white text-black px-4 py-2 mt-2 border border-[#A9A9A9] rounded-lg text-base font-normal cursor-pointer flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-[#EEF5FE] hover:border-[#CBE0FA]"
        >
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google Logo"
                width={20}
                height={20}
                className="inline-block"
            />
            <span>Continue with Google</span>
        </button>
    );
}
