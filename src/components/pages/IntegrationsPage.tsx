
import { Button, Grid, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { queries } from "@api/index"
import { useParams, useLocation } from "react-router"
import { useEffect } from "react"
import { encrypt } from "@helpers/encrypt"
import { client } from "@api/index"
import { useUtilityStore } from "@store/utilityStore"
import { IntegrationForm } from "@components/custom/forms/premade/IntegrationForm"
import { useFilePicker } from "@components/custom/forms/useFilePicker"

const IntegrationsPage = () => {
    const params = useParams();
    const location = useLocation();
    const createMemoryMutation = useMutation(queries.mutate("/api/v1/guardian/create-memory"))
    const createIntegrationMutation = useMutation(queries.mutate("/api/v1/guardian/create-integration"))
    const utilityStore = useUtilityStore();
    const { openFilePicker, FileInput } = useFilePicker((files) => {
        console.log(files);
    });

    const handleSubmit = async (values: any) => {
        console.log(values);
        if (Object.keys(values.value).some(key => !values.value[key])) {
            utilityStore.createAlert("error", "Please fill out all fields")
            return;
        };

        const sensitive = {
            ...values.value,
            "user_id": import.meta.env.VITE_ADMIN_USER_ID
        };

        const { ciphertext, iv, tag } = await encrypt(
            JSON.stringify(sensitive),
            import.meta.env.VITE_MEMORY_ENCRYPTION_KEY
        );
      
        const encryptedPayload = {
            user_id: import.meta.env.VITE_ADMIN_USER_ID,
            service: values.value.service,
            encrypted_token: ciphertext,
            iv,
            auth_tag: tag
        };
        createIntegrationMutation
            .mutate(
                encryptedPayload,
                {
                    onSuccess: (data) => {
                        console.log(data);
                        utilityStore.createAlert("success", "Integration created successfully")
                        utilityStore.setModal({ open: false, content: null })
                    },
                    onError: (error) => {
                        console.log(error);
                        utilityStore.createAlert("error", "Failed to create integration")
                    }
                }
            )
    }

    useEffect(() => {
        (async () => {
            const code = new URLSearchParams(window.location.search).get("code");
            await client.post("/api/v1/auth/callback", {
                "service": "github",
                "user_id": import.meta.env.VITE_ADMIN_USER_ID,
                "code": code
            });
        })();
    }, [])
    const handleIntegrationForm = async (integration: string) => {
        const columns = {
            "notion": [
            {
                name: "service",
                // @ts-ignore
                label: "Integration Type",
                dataType: "text",
                enumValues: ["notion", "github", "stripe"],
                defaultValue: integration
            },
            {
                name: "token",
                // @ts-ignore
                label: "API Token",
                type: "text",
                fieldType: "password",
                dataType: "text",
                description: "Enter your integration token (will be encrypted)"
            },
            {
                name: "database_id",
                // @ts-ignore
                label: "Database ID",
                dataType: "text"
            },
            {
                name: "page_id",
                // @ts-ignore
                label: "Page ID",
                dataType: "text"
            },
        ],
        "email": [
            {
                name: "service",
                // @ts-ignore
                label: "Integration Type",
                dataType: "text",
                enumValues: ["notion", "github", "stripe", "email", "slack"]
            },
            {
                name: "webhook_url",
                // @ts-ignore
                label: "Webhook URL",
                type: "text",
                fieldType: "url",
                dataType: "text",
                description: "Enter your integration webhook URL. Instructions for setting up can be found here 👉 [Gmail App Scripts](https://developers.google.com/apps-script/quickstart/gmail)"
            }
        ]
        }[integration]
        utilityStore.setModal({
            open: true,
            content: <IntegrationForm 
                userId={import.meta.env.VITE_ADMIN_USER_ID as string} 
                columns={columns}
                onSubmit={(values) => {
                    console.log(values);
                    handleSubmit(values);
                }}
            />
        })
    }
    return (
        <>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Integrations
            </Typography>
            <Button onClick={() => {
                window.open("https://github.com/login/oauth/authorize?client_id=" + import.meta.env.VITE_GITHUB_CLIENT_ID + "&redirect_uri=" + "http://localhost:5173/auth/callback/github", "_blank");
            }}>GitHub</Button>
            <Typography>Create Memories from GitHub Commits</Typography>
            <Button variant="outlined" onClick={() => createMemoryMutation.mutate({
                "user_id": import.meta.env.VITE_ADMIN_USER_ID,
                "service": "github",
                "details": {
                    "repo": "",
                    "branch": "main",
                    "commit_id": ""
                }
            })}>Create Memory</Button>
            <Button variant="outlined">Schedule</Button>
            <hr />
            <Grid container spacing={2} mt={2}>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={() => handleIntegrationForm("notion")}
                >
                    Notion
                </Button>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={() => handleIntegrationForm("email")}
                >
                    Email
                </Button>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    onClick={() => handleIntegrationForm("slack")}
                >
                    Slack
                </Button>
                {FileInput}
            </Grid>
        </>
    )
}

export default IntegrationsPage