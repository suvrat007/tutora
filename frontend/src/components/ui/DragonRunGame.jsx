import { useCallback, useEffect, useRef } from "react";

/**
 * Dragon Run — a Chrome-dino style endless runner for the cold-start wait.
 *
 * Everything is vector-drawn on a canvas: no sprite assets, no game library,
 * and no React re-renders while playing (all state lives in refs and the loop
 * paints straight to the canvas).
 *
 * Controls: Space / ArrowUp / W / tap -> jump, ArrowDown / S -> duck.
 */

const HIGH_SCORE_KEY = "tutora_dragon_high_score";

// The world is laid out in logical pixels and scaled by devicePixelRatio.
const WORLD_H = 220;
const GROUND_Y = WORLD_H - 34;

const GRAVITY = 2600;
const JUMP_V = -880;
const FAST_FALL_MULT = 3.2;

const START_SPEED = 330;
const MAX_SPEED = 760;
const SPEED_PER_PX = 0.011; // how quickly the run accelerates with distance
const PX_PER_POINT = 11; // distance travelled per point of score

const DRAGON_X = 54;
const DRAGON_W = 50;
const DRAGON_H = 44;
const DUCK_H = 28;

const AIR_OBSTACLES_FROM = 500; // score at which flyers start appearing

const C = {
    skyTop: "#faf1e8",
    skyBottom: "#f2ddc9",
    hillFar: "#e7d5c0",
    hillNear: "#dcc2a3",
    ground: "#8b5e3c",
    groundDetail: "#c4a184",
    body: "#8b5e3c",
    belly: "#e0c4a8",
    wing: "#a8703f",
    crest: "#5a4a3c",
    obstacle: "#7b5c4b",
    obstacleLight: "#a8703f",
    flyer: "#b5643c",
    text: "#5a4a3c",
    textDim: "#a08871",
    flame: "#e07b39",
};

const readHighScore = () => {
    try {
        return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    } catch {
        return 0;
    }
};

const writeHighScore = (value) => {
    try {
        localStorage.setItem(HIGH_SCORE_KEY, String(value));
    } catch {
        /* private mode / storage disabled — the run just isn't remembered */
    }
};

const roundRect = (ctx, x, y, w, h, r) => {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
};

const pad = (n, len) => String(Math.floor(n)).padStart(len, "0");

/* ---------------------------------------------------------------- drawing */

const drawDragon = (ctx, d, t) => {
    const { w, h, ducking, onGround, dead } = d;
    ctx.save();
    ctx.translate(d.x, d.y);

    const bob = onGround && !ducking ? Math.sin(t * 16) * 1.2 : 0;
    ctx.translate(0, bob);

    // Tail — sways while running, streams out behind while airborne.
    const tailWave = Math.sin(t * (onGround ? 12 : 20)) * (ducking ? 2 : 4);
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.42);
    ctx.quadraticCurveTo(-w * 0.16, h * 0.3 + tailWave, -w * 0.3, h * 0.55 + tailWave);
    ctx.quadraticCurveTo(-w * 0.05, h * 0.6, w * 0.2, h * 0.74);
    ctx.closePath();
    ctx.fill();

    // Legs (behind the body) — alternating stride on the ground, tucked in the air.
    ctx.fillStyle = C.body;
    if (ducking) {
        roundRect(ctx, w * 0.3, h * 0.72, 9, h * 0.28, 3);
        ctx.fill();
        roundRect(ctx, w * 0.56, h * 0.72, 9, h * 0.28, 3);
        ctx.fill();
    } else if (onGround) {
        const stride = Math.sin(t * 17) * 7;
        roundRect(ctx, w * 0.34 + stride, h * 0.68, 9, h * 0.34, 3);
        ctx.fill();
        roundRect(ctx, w * 0.56 - stride, h * 0.68, 9, h * 0.34, 3);
        ctx.fill();
    } else {
        roundRect(ctx, w * 0.36, h * 0.66, 9, h * 0.24, 3);
        ctx.fill();
        roundRect(ctx, w * 0.56, h * 0.7, 9, h * 0.2, 3);
        ctx.fill();
    }

    // Body
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.ellipse(w * 0.46, h * 0.55, w * 0.34, h * (ducking ? 0.3 : 0.33), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.belly;
    ctx.beginPath();
    ctx.ellipse(w * 0.48, h * 0.68, w * 0.24, h * (ducking ? 0.14 : 0.17), 0, 0, Math.PI * 2);
    ctx.fill();

    // Back crest
    ctx.fillStyle = C.crest;
    for (let i = 0; i < 3; i += 1) {
        const sx = w * (0.24 + i * 0.14);
        const sy = h * (ducking ? 0.32 : 0.26) + i * 0.6;
        ctx.beginPath();
        ctx.moveTo(sx, sy + 6);
        ctx.lineTo(sx + 6, sy - 4);
        ctx.lineTo(sx + 12, sy + 6);
        ctx.closePath();
        ctx.fill();
    }

    // Wing — slow flap on the ground, hard beats mid-jump.
    const flap = onGround ? Math.sin(t * 13) * 0.22 : Math.sin(t * 26) * 0.55 - 0.35;
    ctx.save();
    ctx.translate(w * 0.44, h * 0.42);
    ctx.rotate(ducking ? 0.5 : flap);
    ctx.fillStyle = C.wing;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-w * 0.3, -h * (ducking ? 0.1 : 0.34));
    ctx.lineTo(w * 0.04, h * 0.06);
    ctx.lineTo(w * 0.2, -h * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Head + snout
    const headX = w * 0.8;
    const headY = h * (ducking ? 0.42 : 0.28);
    ctx.fillStyle = C.body;
    ctx.beginPath();
    ctx.ellipse(headX, headY, w * 0.2, h * 0.21, 0, 0, Math.PI * 2);
    ctx.fill();
    roundRect(ctx, headX + w * 0.06, headY - h * 0.02, w * 0.24, h * 0.16, 4);
    ctx.fill();

    // Horn
    ctx.fillStyle = C.crest;
    ctx.beginPath();
    ctx.moveTo(headX - w * 0.06, headY - h * 0.14);
    ctx.lineTo(headX - w * 0.14, headY - h * 0.36);
    ctx.lineTo(headX + w * 0.03, headY - h * 0.16);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fffaf4";
    ctx.beginPath();
    ctx.arc(headX + w * 0.08, headY - h * 0.03, 3.4, 0, Math.PI * 2);
    ctx.fill();
    if (dead) {
        // X-eye on the way out
        ctx.strokeStyle = "#3d3129";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(headX + w * 0.04, headY - h * 0.09);
        ctx.lineTo(headX + w * 0.14, headY + h * 0.03);
        ctx.moveTo(headX + w * 0.14, headY - h * 0.09);
        ctx.lineTo(headX + w * 0.04, headY + h * 0.03);
        ctx.stroke();
    } else {
        ctx.fillStyle = "#3d3129";
        ctx.beginPath();
        ctx.arc(headX + w * 0.1, headY - h * 0.03, 1.7, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
};

const drawObstacle = (ctx, o) => {
    if (o.type === "flyer") {
        const wingUp = Math.sin(o.anim * 18) * 0.55;
        ctx.save();
        ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
        ctx.fillStyle = C.flyer;
        ctx.beginPath();
        ctx.ellipse(0, 0, o.w * 0.26, o.h * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        [-1, 1].forEach((dir) => {
            ctx.save();
            ctx.scale(dir, 1);
            ctx.rotate(wingUp);
            ctx.beginPath();
            ctx.moveTo(o.w * 0.16, -o.h * 0.05);
            ctx.quadraticCurveTo(o.w * 0.6, -o.h * 0.55, o.w * 0.62, o.h * 0.1);
            ctx.quadraticCurveTo(o.w * 0.4, o.h * 0.05, o.w * 0.16, o.h * 0.16);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
        return;
    }

    // Ground spire — a jagged rock the dragon has to hop.
    ctx.fillStyle = C.obstacle;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y + o.h);
    ctx.lineTo(o.x + o.w * 0.2, o.y + o.h * 0.18);
    ctx.lineTo(o.x + o.w * 0.5, o.y);
    ctx.lineTo(o.x + o.w * 0.8, o.y + o.h * 0.24);
    ctx.lineTo(o.x + o.w, o.y + o.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.obstacleLight;
    ctx.beginPath();
    ctx.moveTo(o.x + o.w * 0.5, o.y);
    ctx.lineTo(o.x + o.w * 0.8, o.y + o.h * 0.24);
    ctx.lineTo(o.x + o.w * 0.62, o.y + o.h);
    ctx.lineTo(o.x + o.w * 0.5, o.y + o.h);
    ctx.closePath();
    ctx.fill();
};

/* ------------------------------------------------------------------- game */

const DragonRunGame = ({ onPlayStateChange }) => {
    const canvasRef = useRef(null);
    const wrapRef = useRef(null);
    const stateRef = useRef(null);
    const rafRef = useRef(0);
    const playStateRef = useRef("idle");

    const reportPlayState = useCallback(
        (next) => {
            if (playStateRef.current === next) return;
            playStateRef.current = next;
            onPlayStateChange?.(next);
        },
        [onPlayStateChange]
    );

    const resetRun = useCallback((s) => {
        s.distance = 0;
        s.speed = START_SPEED;
        s.obstacles = [];
        s.particles = [];
        s.spawnTimer = 1.1;
        s.dead = false;
        s.deadTimer = 0;
        s.dragon = {
            x: DRAGON_X,
            y: GROUND_Y - DRAGON_H,
            vy: 0,
            w: DRAGON_W,
            h: DRAGON_H,
            onGround: true,
            ducking: false,
            dead: false,
        };
    }, []);

    const jump = useCallback(() => {
        const s = stateRef.current;
        if (!s) return;

        if (!s.running) {
            // Ignore the first moments after a crash so a mashed key doesn't
            // blow straight past the game-over screen.
            if (s.dead && s.deadTimer < 0.4) return;
            resetRun(s);
            s.running = true;
            reportPlayState("playing");
            return;
        }

        const d = s.dragon;
        if (d.onGround) {
            d.vy = JUMP_V;
            d.onGround = false;
            d.ducking = false;
            // Puff of flame off the launch.
            for (let i = 0; i < 6; i += 1) {
                s.particles.push({
                    x: d.x + d.w * 0.95,
                    y: d.y + d.h * 0.3,
                    vx: 40 + Math.random() * 70,
                    vy: -20 + Math.random() * 40,
                    life: 0.35 + Math.random() * 0.25,
                    age: 0,
                    r: 2 + Math.random() * 3,
                });
            }
        }
    }, [resetRun, reportPlayState]);

    const setDuck = useCallback((down) => {
        const s = stateRef.current;
        if (!s || !s.running) return;
        s.dragon.ducking = down;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return undefined;
        const ctx = canvas.getContext("2d");
        // jsdom (and any canvas-less environment) hands back null — bail out
        // rather than throwing inside the render loop.
        if (!ctx) return undefined;

        const s = {
            width: 600,
            running: false,
            dead: false,
            deadTimer: 0,
            distance: 0,
            speed: START_SPEED,
            obstacles: [],
            particles: [],
            clouds: [],
            hills: [],
            spawnTimer: 1.1,
            time: 0,
            highScore: readHighScore(),
            dragon: null,
        };
        stateRef.current = s;
        resetRun(s);

        for (let i = 0; i < 4; i += 1) {
            s.clouds.push({
                x: Math.random() * 900,
                y: 26 + Math.random() * 50,
                scale: 0.6 + Math.random() * 0.7,
            });
        }
        for (let i = 0; i < 8; i += 1) {
            s.hills.push({
                x: Math.random() * 1000,
                h: 26 + Math.random() * 34,
                w: 90 + Math.random() * 90,
            });
        }

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cssW = Math.max(300, wrap.clientWidth);
            s.width = cssW;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(WORLD_H * dpr);
            canvas.style.width = `${cssW}px`;
            canvas.style.height = `${WORLD_H}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(wrap);

        const score = () => s.distance / PX_PER_POINT;

        const spawn = () => {
            const sc = score();
            const canFly = sc > AIR_OBSTACLES_FROM;

            if (canFly && Math.random() < 0.3) {
                // Low enough that ducking is the clean answer, high enough to jump early.
                s.obstacles.push({
                    type: "flyer",
                    x: s.width + 40,
                    y: GROUND_Y - DRAGON_H - 10,
                    w: 42,
                    h: 26,
                    anim: 0,
                });
            } else {
                const count = sc > 300 && Math.random() < 0.45 ? 2 + (Math.random() < 0.3 ? 1 : 0) : 1;
                const h = 30 + Math.random() * 20;
                const w = 16 + Math.random() * 8;
                for (let i = 0; i < count; i += 1) {
                    s.obstacles.push({
                        type: "spire",
                        x: s.width + 40 + i * (w + 4),
                        y: GROUND_Y - h,
                        w,
                        h,
                        anim: 0,
                    });
                }
            }

            // Enough room to land and set up the next jump, scaled to current speed.
            const gap = s.speed * 0.95 + 50 + Math.random() * s.speed * 0.75;
            s.spawnTimer = gap / s.speed;
        };

        const die = () => {
            s.running = false;
            s.dead = true;
            s.deadTimer = 0;
            s.dragon.dead = true;
            const final = Math.floor(score());
            if (final > s.highScore) {
                s.highScore = final;
                writeHighScore(final);
            }
            reportPlayState("gameover");
        };

        // Generous insets — a visual near-miss should not read as a hit.
        const hits = (d, o) =>
            d.x + 8 < o.x + o.w - 3 &&
            d.x + d.w - 6 > o.x + 3 &&
            d.y + 6 < o.y + o.h - 3 &&
            d.y + d.h - 2 > o.y + 3;

        const update = (dt) => {
            s.time += dt;
            if (s.dead) s.deadTimer += dt;

            const scrollSpeed = s.running ? s.speed : 0;

            s.clouds.forEach((c) => {
                c.x -= (scrollSpeed * 0.12 + 6) * dt;
                if (c.x < -120) {
                    c.x = s.width + Math.random() * 200;
                    c.y = 22 + Math.random() * 55;
                }
            });
            s.hills.forEach((hl) => {
                hl.x -= (scrollSpeed * 0.3 + 10) * dt;
                if (hl.x < -hl.w) {
                    hl.x = s.width + Math.random() * 260;
                    hl.h = 26 + Math.random() * 34;
                }
            });

            if (!s.running) return;

            s.distance += s.speed * dt;
            s.speed = Math.min(MAX_SPEED, START_SPEED + s.distance * SPEED_PER_PX);

            const d = s.dragon;
            const g = GRAVITY * (d.ducking && !d.onGround ? FAST_FALL_MULT : 1);
            d.vy += g * dt;
            d.y += d.vy * dt;

            // Ducking shrinks the hitbox; keep the feet planted while it changes.
            const targetH = d.ducking && d.onGround ? DUCK_H : DRAGON_H;
            if (d.h !== targetH) {
                const bottom = d.y + d.h;
                d.h = targetH;
                if (d.onGround) d.y = bottom - d.h;
            }

            if (d.y + d.h >= GROUND_Y) {
                d.y = GROUND_Y - d.h;
                d.vy = 0;
                d.onGround = true;
            }

            s.spawnTimer -= dt;
            if (s.spawnTimer <= 0) spawn();

            s.obstacles.forEach((o) => {
                o.x -= s.speed * dt;
                o.anim += dt;
            });
            s.obstacles = s.obstacles.filter((o) => o.x + o.w > -20);

            s.particles.forEach((p) => {
                p.age += dt;
                p.x += (p.vx - s.speed) * dt;
                p.y += p.vy * dt;
            });
            s.particles = s.particles.filter((p) => p.age < p.life);

            for (const o of s.obstacles) {
                if (hits(d, o)) {
                    die();
                    break;
                }
            }
        };

        const render = () => {
            const w = s.width;

            const sky = ctx.createLinearGradient(0, 0, 0, WORLD_H);
            sky.addColorStop(0, C.skyTop);
            sky.addColorStop(1, C.skyBottom);
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, WORLD_H);

            ctx.fillStyle = "rgba(255,255,255,0.75)";
            s.clouds.forEach((c) => {
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.scale(c.scale, c.scale);
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.arc(16, 3, 9, 0, Math.PI * 2);
                ctx.arc(-14, 4, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Two parallax layers of hills, drawn far-then-near.
            ctx.fillStyle = C.hillFar;
            s.hills.forEach((hl, i) => {
                if (i % 2) return;
                ctx.beginPath();
                ctx.moveTo(hl.x, GROUND_Y);
                ctx.lineTo(hl.x + hl.w / 2, GROUND_Y - hl.h - 12);
                ctx.lineTo(hl.x + hl.w, GROUND_Y);
                ctx.closePath();
                ctx.fill();
            });
            ctx.fillStyle = C.hillNear;
            s.hills.forEach((hl, i) => {
                if (!(i % 2)) return;
                ctx.beginPath();
                ctx.moveTo(hl.x, GROUND_Y);
                ctx.lineTo(hl.x + hl.w / 2, GROUND_Y - hl.h);
                ctx.lineTo(hl.x + hl.w, GROUND_Y);
                ctx.closePath();
                ctx.fill();
            });

            ctx.strokeStyle = C.ground;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, GROUND_Y + 1);
            ctx.lineTo(w, GROUND_Y + 1);
            ctx.stroke();
            ctx.fillStyle = C.groundDetail;
            const offset = s.distance % 60;
            for (let x = -offset; x < w; x += 60) {
                ctx.fillRect(x + 10, GROUND_Y + 8, 14, 2);
                ctx.fillRect(x + 34, GROUND_Y + 16, 8, 2);
            }

            s.particles.forEach((p) => {
                ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
                ctx.fillStyle = C.flame;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            s.obstacles.forEach((o) => drawObstacle(ctx, o));
            drawDragon(ctx, s.dragon, s.time);

            ctx.font = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";
            ctx.textAlign = "right";
            if (s.highScore > 0) {
                ctx.fillStyle = C.textDim;
                ctx.fillText(`HI ${pad(s.highScore, 5)}`, w - 92, 24);
            }
            ctx.fillStyle = C.text;
            ctx.fillText(pad(score(), 5), w - 14, 24);

            ctx.textAlign = "center";
            if (!s.running && !s.dead) {
                ctx.fillStyle = C.text;
                ctx.font = "600 15px system-ui, sans-serif";
                ctx.fillText("Press Space or tap to fly", w / 2, WORLD_H / 2 - 22);
                ctx.fillStyle = C.textDim;
                ctx.font = "13px system-ui, sans-serif";
                ctx.fillText("↑ jump    ↓ duck", w / 2, WORLD_H / 2 - 2);
            } else if (s.dead) {
                ctx.fillStyle = "rgba(248,237,227,0.75)";
                ctx.fillRect(0, WORLD_H / 2 - 44, w, 62);
                ctx.fillStyle = C.text;
                ctx.font = "700 17px system-ui, sans-serif";
                ctx.fillText("Game Over", w / 2, WORLD_H / 2 - 20);
                ctx.fillStyle = C.textDim;
                ctx.font = "13px system-ui, sans-serif";
                ctx.fillText("Space or tap to run again", w / 2, WORLD_H / 2 + 2);
            }
            ctx.textAlign = "left";
        };

        let last = performance.now();
        const loop = (now) => {
            // Clamp dt so a backgrounded tab doesn't teleport the dragon into a rock.
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            update(dt);
            render();
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        const onVisibility = () => {
            last = performance.now();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelAnimationFrame(rafRef.current);
            ro.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            stateRef.current = null;
        };
    }, [resetRun, reportPlayState]);

    // Keyboard: swallow Space/arrows so the page behind never scrolls.
    useEffect(() => {
        const isJump = (e) => e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW";
        const isDuck = (e) => e.code === "ArrowDown" || e.code === "KeyS";

        const onKeyDown = (e) => {
            if (e.repeat && isJump(e)) {
                e.preventDefault();
                return;
            }
            if (isJump(e)) {
                e.preventDefault();
                jump();
            } else if (isDuck(e)) {
                e.preventDefault();
                setDuck(true);
            }
        };
        const onKeyUp = (e) => {
            if (isDuck(e)) setDuck(false);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [jump, setDuck]);

    return (
        <div ref={wrapRef} className="w-full select-none">
            <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                    e.preventDefault();
                    jump();
                }}
                className="block w-full cursor-pointer touch-none rounded-xl border border-[#e0c4a8] bg-[#faf1e8]"
            />

            {/* Touch controls — a tap on the canvas can't express "duck". */}
            <div className="mt-3 flex gap-3 sm:hidden">
                <button
                    type="button"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        jump();
                    }}
                    className="flex-1 rounded-xl bg-[#8b5e3c] py-3 font-semibold text-[#f8ede3] transition-transform active:scale-95"
                >
                    Jump
                </button>
                <button
                    type="button"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        setDuck(true);
                    }}
                    onPointerUp={() => setDuck(false)}
                    onPointerLeave={() => setDuck(false)}
                    onPointerCancel={() => setDuck(false)}
                    className="flex-1 rounded-xl border border-[#8b5e3c] py-3 font-semibold text-[#8b5e3c] transition-transform active:scale-95"
                >
                    Duck
                </button>
            </div>
        </div>
    );
};

export default DragonRunGame;
