### Human Approval Interface
```typescript
// frontend/approval-dashboard/src/components/ApprovalDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Download,
  Print
} from '@mui/icons-material';

interface ApprovalItem {
  id: string;
  item_data: {
    name: string;
    sku: string;
    price: string;
    batch: string;
    supplier: string;
    coa_verified: boolean;
  };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  expires_at: string;
  approver?: string;
  approved_at?: string;
  rejection_reason?: string;
  comments: Array<{
    comment: string;
    author: string;
    timestamp: string;
  }>;
}

const ApprovalDashboard: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionComments, setRejectionComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch('/api/approval/pending');
      const data = await response.json();
      setApprovals(data.approvals || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/approval/approve/${selectedApproval.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approver: 'current_user', // Replace with actual user
          comments: approvalComments
        }),
      });

      if (response.ok) {
        setApprovalDialog(false);
        setApprovalComments('');
        fetchPendingApprovals();
      }
    } catch (error) {
      console.error('Error approving item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/approval/reject/${selectedApproval.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approver: 'current_user', // Replace with actual user
          reason: rejectionReason,
          comments: rejectionComments
        }),
      });

      if (response.ok) {
        setRejectionDialog(false);
        setRejectionReason('');
        setRejectionComments('');
        fetchPendingApprovals();
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalDialog = (approval: ApprovalItem) => {
    setSelectedApproval(approval);
    setApprovalDialog(true);
  };

  const openRejectionDialog = (approval: ApprovalItem) => {
    setSelectedApproval(approval);
    setRejectionDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Approval Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Human-in-the-loop approval for new products
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Approvals ({approvals.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>COA Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Expires</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>{approval.item_data.name}</TableCell>
                        <TableCell>{approval.item_data.sku}</TableCell>
                        <TableCell>{approval.item_data.supplier}</TableCell>
                        <TableCell>${approval.item_data.price}</TableCell>
                        <TableCell>
                          <Chip
                            label={approval.item_data.coa_verified ? 'Verified' : 'Pending'}
                            color={approval.item_data.coa_verified ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(approval.created_at)}</TableCell>
                        <TableCell>{formatDate(approval.expires_at)}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => openApprovalDialog(approval)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openRejectionDialog(approval)}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Approve Product</DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedApproval.item_data.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">SKU:</Typography>
                  <Typography variant="body1">{selectedApproval.item_data.sku}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Price:</Typography>
                  <Typography variant="body1">${selectedApproval.item_data.price}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Supplier:</Typography>
                  <Typography variant="body1">{selectedApproval.item_data.supplier}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Batch:</Typography>
                  <Typography variant="body1">{selectedApproval.item_data.batch}</Typography>
                </Grid>
              </Grid>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Approval Comments"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleApprove} 
            variant="contained" 
            color="success"
            disabled={loading}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reject Product</DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedApproval.item_data.name}
              </Typography>
              
              <TextField
                fullWidth
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rejection Comments"
                value={rejectionComments}
                onChange={(e) => setRejectionComments(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={loading || !rejectionReason}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalDashboard;
```

---
