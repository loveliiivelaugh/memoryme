import { useState } from 'react';
import { Box, Tooltip, Typography, Paper, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Chip, Stack} from '@mui/material';
import { motion } from 'framer-motion';

type MemoryPayload = {
  tags: string[];
  source: string;
  content: string;
  project?: string;
  summary?: string;
  blog_used?: boolean;
  is_bloggable?: boolean;
  source_id?: string;
  created_at?: string;
};

type Memory = {
  id: string;
  agent: string;
  title: string;
  type: string;
  payload: MemoryPayload;
  created_at: string;
};

export default function MemoryCard({ memory }: { memory: Memory }) {
  const { agent, title, type, payload, created_at } = memory;
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Chip
              size="small"
              label={type}
              variant="outlined"
              sx={{ fontSize: '0.7rem', textTransform: 'uppercase' }}
            />
          </Stack>

          {payload.summary && (
            <Typography variant="subtitle2" color="text.secondary">
              {payload.summary}
            </Typography>
          )}

          <Box
            sx={{
              fontSize: 13,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.default',
              color: 'secondary.light',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Typography sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>{payload.content}</Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton onClick={() => handleCopy(payload.content)} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            {/* {payload.content} */}
          </Box>

          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ fontSize: 12, color: 'text.secondary' }}>
            <span>🧠 <b>{agent}</b></span>
            {payload.project && <span>📁 Project: <b>{payload.project}</b></span>}
            <span>📅 {new Date(created_at).toLocaleString()}</span>
          </Stack>

          {payload.tags?.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {payload.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  sx={{ bgcolor: 'grey.800', color: 'primary.light' }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </motion.div>
  );
}
