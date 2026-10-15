"use client"

import React, { useState } from 'react';

export default function Header() {
    return (
        <main className="h-15 w-screen bg-stone-300 ">
        <header
            id="header"
            className="header d-flex align-items-center justify-center fixed-top ">
                <div className='container-fluid container-xl g-flex align-items-center justify-content-between'>
                <a
                    href="/"
                        className="logo  d-flex align-items-center justify-center"
                >
                    {/* <image src="" alt="" /> */}
                        <h1 className='mx-15 my-4 '>Blog Me</h1>
                </a>
            </div>
        </header>
        </main>
    )
}