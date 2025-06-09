
import { Breadcrumbs, Button, Chip, Container, ListItemText, Grid, Typography, Box, Card, CardContent } from "@mui/material"
import { useMutation, useQuery } from "@tanstack/react-query"
import { queries } from "@api/index"
import { useParams, useLocation, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { encrypt, decrypt } from "@helpers/encrypt"
import { client } from "@api/index"
import { useUtilityStore } from "@store/utilityStore"
import { IntegrationForm } from "@components/custom/forms/premade/IntegrationForm"
import { useFilePicker } from "@components/custom/forms/useFilePicker"
import { MemoryCard2 } from "@components/custom/MemoryList"
import NotionIcon from "@mui/icons-material/NoteAdd"
import GitHubIcon from "@mui/icons-material/GitHub"
import EmailIcon from "@mui/icons-material/Email"
import SlackIcon from "@mui/icons-material/Map"
import { CardActions } from "@mui/material";

const integrationsMeta = {
  notion: {
    name: "Notion",
    description: "Connect your Notion workspace to automatically save your memories from Notion.",
    image: NotionIcon,
    fields: [
      {
        name: "service",
        label: "Integration Type",
        dataType: "text",
        enumValues: ["notion"],
        defaultValue: "notion"
      },
      {
        name: "token",
        label: "API Token",
        fieldType: "password",
        dataType: "text",
      },
      {
        name: "database_id",
        label: "Database ID",
        dataType: "text"
      },
      {
        name: "page_id",
        label: "Page ID",
        dataType: "text"
      }
    ]
  },
  email: {
    name: "Gmail",
    description: "Connect your Gmail account to automatically save your memories from Gmail.",
    image: EmailIcon,
    fields: [
      {
        name: "service",
        label: "Integration Type",
        dataType: "text",
        enumValues: ["email"],
        defaultValue: "email"
      },
      {
        name: "webhook_url",
        label: "Webhook URL",
        fieldType: "url",
        dataType: "text",
        description: "Enter the webhook that delivers your emails to Memory.me"
      }
    ]
  },
  github: {
    name: "GitHub",
    description: "Connect your GitHub account to automatically save your memories from GitHub.",
    image: GitHubIcon
  }
};

export function IntegrationsGrid() {
    const utilityStore = useUtilityStore();
    const integrationsData = useQuery(queries.query(`/database/read_db/user_integrations`))
    console.log(integrationsData)
    const userIntegrations = integrationsData?.data?.data || [];

    const handleIntegrationForm = (integration: "notion" | "email") => {
        const config = integrationsMeta[integration];
        utilityStore.setModal({
        open: true,
        content: (
            <IntegrationForm
            userId={import.meta.env.VITE_ADMIN_USER_ID as string}
            columns={config.fields}
            onSubmit={(values) => {
                console.log("Integration form values:", values);
                // handleSubmit(values);
            }}
            />
        )
        });
    };

  const handleGithubConnect = () => {
    window.open(
      `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=http://localhost:5173/auth/callback/github`,
      "_blank"
    );
  };

  return (
    <Grid container spacing={4}>
      {(["notion", "email", "github"] as const).map((key) => {
        const item = integrationsMeta[key];
        const isConnected = userIntegrations.some((i: any) => i.service === key)
        return (
          <Grid size={{ xs: 12, md: 12, lg: 12 }} key={key}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
                <Grid container>
                    <Grid size={8}>
                        <CardContent>
                            <Typography variant="h4" gutterBottom>
                                {item.name}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Connect {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.description}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant={isConnected ? "contained" : "outlined"}
                                // color={isConnected ? "success" : "primary"}
                                color="inherit"
                                fullWidth
                                disabled={isConnected}
                                onClick={() => handleIntegrationForm(key as "notion" | "email")}
                            >
                            {isConnected ? "Connected" : "Connect"}
                            </Button>
                            {isConnected ? (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    onClick={() => {
                                        
                                    }}
                                >
                                    Disconnect
                                </Button>
                            ) : null}
                        </CardActions>
                        {isConnected && (
                            <Chip 
                            label="Connected"
                            color="success"
                            size="small"
                            sx={{ position: "absolute", top: 12, right: 12 }}
                            />
                        )}
                    </Grid>
                    <Grid size={4}>
                        {/* @ts-ignore */}
                        <Box
                            component="img"
                            src={item.image}
                            alt={`${item.name} Logo`}
                            sx={{ width: "100%", height: 160, objectFit: "cover" }}
                        />
                    </Grid>
                </Grid>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export const IntegrationButtons = () => {
    const utilityStore = useUtilityStore();
    const createMemoryMutation = useMutation(queries.mutate("/api/v1/guardian/create-memory"));
    const createIntegrationMutation = useMutation(queries.mutate("/api/v1/guardian/create-integration"));
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
    };

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
        <Grid container spacing={2} mt={2}>
            <Button 
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => {
                    window.open("https://github.com/login/oauth/authorize?client_id=" + import.meta.env.VITE_GITHUB_CLIENT_ID + "&redirect_uri=" + "http://localhost:5173/auth/callback/github", "_blank");
                }}
            >
                GitHub
            </Button>
            <Typography variant="body2" color="text.secondary">Create Memories from GitHub Commits</Typography>
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
    )
}

const  IntegrationsPage = () => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const encryptedMemoriesQuery = useQuery(queries.query("/database/read_db/encrypted_memories?user_id=" + import.meta.env.VITE_ADMIN_USER_ID))
    const utilityStore = useUtilityStore();
    
    const [decryptedMemories, setDecryptedMemories] = useState<any[]>([]);
    const encryptedMemories = encryptedMemoriesQuery.data?.data || [];
    console.log("encryptedMemories: ", encryptedMemories)
    useEffect(() => {
        if (!encryptedMemoriesQuery.data) return;
        (async () => {
            const decryptedMemories = await Promise.all(
                encryptedMemories.map(async (mem: any) => {
                  try {
                    const plaintext = await decrypt(
                      mem.encrypted_data,
                      mem.iv,
                      mem.tag,
                      import.meta.env.VITE_MEMORY_ENCRYPTION_KEY // base64 string
                    );
              
                    return {
                      ...mem,
                      content: JSON.parse(plaintext) // if you encrypted JSON
                    };
                  } catch (err) {
                    console.error("Failed to decrypt memory", mem.id, err);
                    return { ...mem, content: null };
                  }
                })
              );
              setDecryptedMemories(decryptedMemories);
              console.log("decryptedMemories: ", decryptedMemories)
        })();
    }, [encryptedMemories]);

    useEffect(() => {
        (async () => {
            const code = new URLSearchParams(window.location.search).get("code");
            if (!code) return;
            await client.post("/api/v1/auth/callback", {
                "service": "github",
                "user_id": import.meta.env.VITE_ADMIN_USER_ID,
                "code": code
            });
        })();
    }, [])
    
    return (
        <Container maxWidth="lg">
            <ListItemText primary={
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Recent Memories <Chip size="small" label={decryptedMemories.length} />
                </Typography>
            } secondary="AES-256-GCM Encrypted" />
            {/* <Stack spacing={2} sx={{ maxHeight: "360px", overflowY: "scroll" }}> */}
                <Grid container spacing={2}>
                    {decryptedMemories.reverse().slice(0, 8).map((memory: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 2 }} key={memory.trace_id}>
                            <MemoryCard2 memory={memory.content} />
                        </Grid>
                    ))}
                    <Grid size={12} sx={{ textAlign: "right", justifyContent: "flex-end" }}>
                        <Breadcrumbs
                            aria-label="breadcrumb"
                            separator="|"
                            // separator={<NavigateBeforeIcon fontSize="small" />}
                        >
                            <Typography variant="body2" color="text.secondary">Page 1</Typography>
                            <Typography variant="body2" color="text.secondary">Page 2</Typography>
                        </Breadcrumbs>
                    </Grid>
                </Grid>
            {/* </Stack> */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Integrations
                </Typography>
                <Button variant="outlined" onClick={() => navigate("/integrations")}>
                    Connect more services
                </Button>
            </Box>
            <hr />
            <Grid container spacing={2}>
                {[
                    { 
                        icon: <NotionIcon />,
                        service: "notion", description: "Connect your Notion account to create memories from your Notion pages" },
                    { 
                        icon: <GitHubIcon />,
                        service: "github", description: "Connect your GitHub account to create memories from your GitHub commits" },
                    { 
                        icon: <EmailIcon />,
                        service: "email", description: "Connect your email account to create memories from your emails" },
                    { 
                        icon: <SlackIcon />,
                        service: "slack", description: "Connect your Slack account to create memories from your Slack messages" }
                ].map((connectedService: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 2 }} key={connectedService.service}>
                        <Card>
                            <CardContent>
                                <Box alignItems="center" >
                                    {connectedService.icon}
                                    <Typography variant="h5">{connectedService.service}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">{connectedService.description}</Typography>
                                <ListItemText
                                    primary={"Connected" + " " + new Date().toLocaleDateString()}
                                    secondary={"Last Synced: " + new Date().toLocaleDateString()}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}

export default IntegrationsPage