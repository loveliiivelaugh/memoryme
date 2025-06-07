import { useEffect, useState } from 'react';
import { Box, Grid, TextField, Tooltip, Typography, Paper, Drawer, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion } from 'framer-motion';
import MemoryCard from '@components/custom/MemoryList';
import { supabase } from '@api/supabase';
import { client } from '@api/index';
import { Timeline } from '@mui/lab';
import { TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';

const MemoryTimeline = ({ memories }: { memories: any[] }) => {
  const getColorForType = (type: string) => {
    switch (type) {
      case 'blog':
        return 'primary';
      case 'memory':
        return 'secondary';
      case 'note':
        return 'success';
      default:
        return 'default';
    }
  };
  return (
    <Timeline>
      {memories.map((mem) => (
        <TimelineItem key={mem.id}>
          <TimelineSeparator>
            {/* getColorForType(mem.type) */}
            <TimelineDot color={"primary"} />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography>{mem.title}</Typography>
            <Typography variant="caption">{mem.created_at}</Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
};


export default function MemoryOverviewPage() {
  // const memoriesQuery = useQuery(queries.query("/database/read_db/memories"))
  // const memories = memoriesQuery.data?.data || [];
  const [memories, setMemories] = useState<any[]>([]);
  const [relatedMemories, setRelatedMemories] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Initial load
  useEffect(() => {
    supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMemories(data);
      });
  }, []);

  // Live updates
  useEffect(() => {
    const channel = supabase
      .channel('memories')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memories' },
        (payload) => {
          // memoriesQuery.refetch();
          setMemories((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Query backend for related
  const fetchRelated = async (value: string) => {
    setQuery(value);
    const res = await client.post("/api/v1/memory/query", {
      query: value
    })
    const data = await res.data;
    setRelatedMemories(data?.memories || []);
  };

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
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="🔍 Search memories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchRelated(query)}
        />
      </Grid>

      <Grid size={8}>
        {memories.map((memory) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setSelected(memory);
              fetchRelated(
                memory.title || memory.payload?.summary || memory.content.slice(0, 50)
              );
            }}
          >
            <MemoryCard memory={memory} />
          </motion.div>
        ))}
      </Grid>

      <Grid size={4}>
        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🔗 Related Memories
          </Typography>

          {query && relatedMemories.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No results for <strong>{query}</strong>
            </Typography>
          ) : (
            relatedMemories.map((memory) => (
              <Paper
                key={memory.id}
                variant="outlined"
                sx={{ p: 2, mb: 2, backgroundColor: 'background.default', cursor: 'pointer' }}
                onClick={() => setSelected(memory)}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {memory.title || 'Untitled'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {memory.payload?.summary || memory.content?.slice(0, 80) + '...'}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      </Grid>

      <Grid size={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🗂️ Memory Timeline
        </Typography>
        <MemoryTimeline memories={memories} />
      </Grid>

      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Memory Detail</Typography>
            <IconButton onClick={() => setSelected(null)}><CloseIcon /></IconButton>
          </Box>

          {selected && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Title</Typography>
              <Typography>{selected.title || 'Untitled'}</Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>Content</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>{selected.content}</Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton onClick={() => handleCopy(selected.content)} size="small">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>Tags</Typography>
              <Typography>{selected.tags?.join(', ')}</Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>Created At</Typography>
              <Typography>{new Date(selected.created_at).toLocaleString()}</Typography>
            </>
          )}
        </Box>
      </Drawer>
    </Grid>
  );
}
