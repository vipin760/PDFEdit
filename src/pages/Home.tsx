export default function Home() {
    return (
        <div className="bg-gray-100 min-h-screen">

            {/* HERO SECTION */}
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                        The Ultimate Free PDF Toolkit
                    </h1>

                    <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
                        Fast, Secure & Easy-to-use tools to manage your PDF files.
                        No Sign-up. No Watermark. Completely Free Forever.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* SECTION TITLE */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-semibold text-gray-800">
                        PDF Tools
                    </h2>
                    <div className="w-20 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
                    <p className="text-gray-500 mt-3">
                        Choose from a wide range of lightning-fast PDF utilities
                    </p>
                </div>

                {/* TOOL GRID */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                        { "title": "Merge PDF", "url": "/merge-pdf" },
                        { "title": "Split PDF", "url": "/split-pdf" },
                        { "title": "Compress PDF", "url": "/compress-pdf" },
                        { "title": "Edit PDF", "url": "/edit-pdf" },
                        { "title": "Unlock PDF", "url": "/unlock-pdf" },
                        { "title": "Protect PDF", "url": "/protect-pdf" },
                        { "title": "PDF to JPG", "url": "/pdf-to-jpg" },
                        { "title": "JPG to PDF", "url": "/jpg-to-pdf" },
                        { "title": "Rotate PDF", "url": "/rotate-pdf" },
                        { "title": "PDF to Word", "url": "/pdf-to-word" },
                        { "title": "PDF to Excel", "url": "/pdf-to-excel" },
                        { "title": "PDF to PPT", "url": "/pdf-to-ppt" }
                    ].map((tool, i) => (
                        <div
                            key={i}
                            className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer border border-gray-200"
                        >
                            <a href={tool.url}>
                                <h3 className="text-lg font-semibold text-gray-800">{tool.title}</h3>
                                <p className="text-gray-500 text-sm mt-2">
                                    {tool.title} quickly in seconds using advanced browser technology.
                                </p>
                            </a>
                        </div>
                    ))}
                </div>

                {/* BENEFIT SECTION */}
                <section className="mt-20 text-center">
                    <h2 className="text-3xl font-semibold text-gray-800">
                        Why Choose Our PDF Tools?
                    </h2>
                    <div className="w-20 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>

                    <p className="text-gray-600 max-w-3xl mx-auto mt-4 text-lg">
                        Built for speed, security, and simplicity — our tools run directly in your
                        browser using advanced client-side technology.
                        Your files never leave your device, ensuring maximum privacy and safety.
                    </p>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
                        <div className="p-6 bg-white rounded-xl shadow border border-gray-200">
                            <h3 className="font-semibold text-gray-800 text-lg">💨 Super Fast</h3>
                            <p className="text-gray-500 mt-2 text-sm">
                                Process files instantly in your browser, no uploads needed.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow border border-gray-200">
                            <h3 className="font-semibold text-gray-800 text-lg">🔒 Secure</h3>
                            <p className="text-gray-500 mt-2 text-sm">
                                Your PDFs stay on your device — nothing stored on our servers.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow border border-gray-200">
                            <h3 className="font-semibold text-gray-800 text-lg">💯 Free Forever</h3>
                            <p className="text-gray-500 mt-2 text-sm">
                                All tools are 100% free with no hidden charges or limits.
                            </p>
                        </div>
                    </div>
                </section>

                {/* OUR MISSION SECTION */}
                <section className="mt-20 bg-white rounded-xl shadow p-10 border border-gray-200">
                    <h2 className="text-3xl font-semibold text-gray-800 text-center">
                        Our Mission
                    </h2>
                    <div className="w-20 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>

                    <p className="text-gray-600 text-lg mt-4 text-center max-w-3xl mx-auto">
                        Our mission is to provide simple, fast, and secure PDF tools to everyone.
                        We believe powerful document tools should be accessible to all —
                        without installing apps, creating accounts, or giving up privacy.
                    </p>
                </section>

                {/* PRIVACY NOTE */}
                <section className="mt-10 text-center text-gray-600 text-sm">
                    <h3 className="text-lg font-semibold text-gray-700">🔐 Privacy Note</h3>
                    <p className="mt-2 max-w-2xl mx-auto">
                        <strong>We do NOT collect, store, or access your personal data.</strong>
                        All PDF operations happen inside your browser for maximum privacy.
                        Your files stay on your device and are never uploaded to our servers.
                    </p>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="text-center text-gray-500 py-6 mt-10">
                © {new Date().getFullYear()} PDF Tools — All Rights Reserved.
            </footer>
        </div>
    );
}
