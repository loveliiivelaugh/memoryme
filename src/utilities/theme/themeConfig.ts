import { colors } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Theme Configuration file to be used in multiple front end ...
// ... microservices applications to maintain consistent theme ...
// ... across all applications. 

const themeConfig = {
    // Light theme
    light: {
        palette: {
            type: "light",
            background: {
                default: "#dfdfdf",
                paper: "#cecece",
            },
            // primary: {
            //     main: "#4A90E2",
            // },
            // text: {
            //     primary: "#444",
            //     secondary: "#555",
            // },
            divider: "rgba(0,0,0,0.06)",
            primary: {
                // Use hue from colors or hex
                // main: colors.indigo["900"],
                main: "#4A90E2",
                // main: "#ccc",
                // Uncomment to specify light/dark
                // shades instead of automatically
                // calculating from above value.
                light: "#4791db",
                dark: "#115293",
            },
            secondary: {
                main: colors.pink["500"],
            },
            // background: {
            //     // Background for <body>
            //     // and <Section color="default">
            //     default: "#f5f5f5",
            //     // Background for elevated
            //     // components (<Card>, etc)
            //     paper: "#fefefe",
            // },
            text: {
                primary: colors.grey["900"],
                secondary: colors.grey["700"],
                disabled: colors.grey["500"],
            },
            // divider: alpha(colors.grey[900], 0.2),
            action: {
                active: alpha(colors.grey[900], 0.54),
                hover: alpha(colors.grey[900], 0.04),
                selected: alpha(colors.grey[900], 0.08),
                disabled: alpha(colors.grey[900], 0.26),
                disabledBackground: alpha(colors.grey[900], 0.12),
            },
            contrastThreshold: 3,
            info: {
                main: "#50AAFF",
                contrastText: "#fff",
            }
        },
    },

    // Dark theme
    dark: {
        border: {
            default: "1px solid #30363d",
            hover: "1px solid #58a6ff",
            active: "1px solid #58a6ff",
            main: "1px solid rgba(88, 166, 255, 0.5)",
        },
        palette: {
            mode: "dark",
            background: {
                default: "#0d1117",
                paper: "#161b22",
            },
            primary: {
                main: "#58a6ff",
                light: "#79b8ff",
                dark: "#1f6feb",
            },
            secondary: {
                main: "#8b949e",
            },
            success: {
                main: "#3fb950",
                contrastText: "#0d1117",
            },
            warning: {
                main: "#d29922",
                contrastText: "#0d1117",
            },
            error: {
                main: "#f85149",
                contrastText: "#fff",
            },
            info: {
                main: "#58a6ff",
                contrastText: "#0d1117",
            },
            text: {
                primary: "#e6edf3",
                secondary: "#8b949e",
                disabled: "#484f58",
            },
            divider: "#30363d",
            action: {
                active: "#e6edf3",
                hover: "rgba(177, 186, 196, 0.08)",
                selected: "rgba(177, 186, 196, 0.12)",
                disabled: "#484f58",
                disabledBackground: "rgba(177, 186, 196, 0.06)",
            },
        },
    },

    // Values for both themes
    common: {
        typography: {
            fontFamily: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`,
            h1: {
                fontWeight: 700,
                fontSize: "2.75rem",
            },
            h2: {
                fontWeight: 600,
                fontSize: "2rem",
            },
            h3: {
                fontWeight: 600,
                fontSize: "1.75rem",
            },
            h4: {
                fontWeight: 600,
                fontSize: "1.5rem",
            },
            h5: {
                fontWeight: 500,
                fontSize: "1.25rem",
            },
            h6: {
                fontWeight: 500,
                fontSize: "1.125rem",
            },
            body1: {
                fontSize: "1rem",
                lineHeight: 1.6,
            },
            body2: {
                fontSize: "0.95rem",
                lineHeight: 1.5
            },
            subtitle1: {
                fontWeight: 500,
                fontSize: "1rem",
                color: "#444"
            },
            button: {
                textTransform: "none",
                fontWeight: 500,
                letterSpacing: 0.5
            }
        },

        shape: {
            borderRadius: 12
        },

        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        transition: "box-shadow 0.3s ease",
                        "&:hover": {
                            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                        }
                    }
                }
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: "inherit", // This respects surrounding text color
                    }
                }
            }
        },
        breakpoints: {
            values: {
                xs: 0,
                sm: 600,
                md: 960,
                lg: 1200,
                xl: 1920
            }
        },
        // Override component styles
        overrides: {
            // Global styles
            MuiCssBaseline: {
                "@global": {
                    "#root": {
                        // Flex column that is height
                        // of viewport so that footer
                        // can push self to bottom by
                        // with auto margin-top
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        // Prevent child elements from
                        // shrinking when content
                        // is taller than the screen
                        // (quirk of flex parent)
                        "& > *": {
                            flexShrink: 0
                        }
                    }
                }
            }
        }
    }
};

export { themeConfig };