import sparrowLogo from "../src/assets/sparrowlogo.svg"

export default function Logo() {
    return (
        <img
            src={sparrowLogo}
            alt="Sparrow Softtech Innovation Unlimited"
            className="h-8 md:h-10 w-auto"
            style={{ imageRendering: "high-quality" }}
        />
    );
}