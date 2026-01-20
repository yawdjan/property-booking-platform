/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, Edit2, RefreshCw, Users, ChevronsUpIcon, ChevronDownIcon } from 'lucide-react';
import { bookingsAPI, commissionsAPI } from '../../services/api';

export default function PayoutManagement() {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approve', 'deny', 'modify'
    const [adminNote, setAdminNote] = useState('');
    const [modifiedAmount, setModifiedAmount] = useState('');
    const [payoutRequests, setPayoutRequests] = useState([]);
    const [bookingsRequests, setbookingsRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalCommissions: 0,
        pendingCommissions: 0,
        paidCommissions: 0,
        pendingPayoutRequests: 0
    });
    // Collapsible sections state - Agent Summary expanded by default
    const [expandedSections, setExpandedSections] = useState({
        agentSummary: true,
        pendingRequests: false,
        approvedPayouts: false,
        requestHistory: false
    });

    // Track which approved payouts have been marked as paid
    const [paidCheckmarks, setPaidCheckmarks] = useState({});

    // Fetch payout requests and stats on component mount
    useEffect(() => {
        fetchPayoutRequests();
        fetchStats();
    }, []);

    const fetchPayoutRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await commissionsAPI.getAllPayouts();
            if (response.success) {
                setPayoutRequests(response.data);
            }
        } catch (err) {
            console.error('Error fetching payout requests:', err);
            setError(err.response?.data?.message || 'Failed to fetch payout requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await bookingsAPI.getAll();

            if (response.success) {
                const commissions = response.data;
                setbookingsRequests(commissions);

                // Total commissions (all)
                const total = commissions
                    .filter(c => c.status === "Completed")
                    .reduce(
                        (sum, c) => sum + parseFloat(c.commissionAmount || 0),
                        0
                    );

                setStats(prev => ({
                    ...prev,
                    totalCommissions: total,
                }));
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    useEffect(() => {
        if (!payoutRequests.length) return;

        const pending = payoutRequests
            .filter(c => c.status === "pending" || c.status === "processing")
            .reduce((sum, c) => sum + parseFloat(c.requestedAmount || 0), 0);

        const paid = payoutRequests
            .filter(c => c.status === "completed" || c.status === "approved")
            .reduce((sum, c) => sum + parseFloat(c.approvedAmount || 0), 0);

        const pendingPayoutRequests = payoutRequests.filter(
            c => c.status === "pending" || c.status === "Requested"
        ).length;

        setStats(prev => ({
            ...prev,
            pendingCommissions: pending,
            paidCommissions: paid,
            pendingPayoutRequests
        }));
    }, [payoutRequests]);

    const handleAction = async () => {
        try {
            let response;

            if (actionType === 'approve') {
                response = await commissionsAPI.approvePayout(
                    selectedRequest.id,
                    null, // No modified amount, use requested amount
                    adminNote
                );
            } else if (actionType === 'modify') {
                // First validate the modified amount
                if (!modifiedAmount || parseFloat(modifiedAmount) <= 0) {
                    alert('Please enter a valid amount');
                    return;
                }

                if (parseFloat(modifiedAmount) > parseFloat(selectedRequest.availableBalance)) {
                    alert('Modified amount exceeds available balance');
                    return;
                }

                // Approve with the modified amount
                response = await commissionsAPI.approvePayoutWithAmount(
                    selectedRequest.id,
                    modifiedAmount,
                    adminNote || `Amount modified from ¢${selectedRequest.requestedAmount.toFixed(2)} to ¢${parseFloat(modifiedAmount).toFixed(2)}`
                );
            } else if (actionType === 'deny') {
                if (!adminNote) {
                    alert('Admin note is required for denial');
                    return;
                }

                response = await commissionsAPI.denyPayout(
                    selectedRequest.id,
                    adminNote
                );
            }

            if (response.success) {
                alert(response.message);
                // Refresh the data
                await fetchPayoutRequests();
                await fetchStats();
            }
        } catch (error) {
            console.error('Error processing action:', error);
            alert(error.response?.data?.message || 'Error processing request');
        }

        setSelectedRequest(null);
        setActionType(null);
        setAdminNote('');
        setModifiedAmount('');
    };

    const availableBalance = (agentId) => {
        return bookingsRequests.filter(r => r.agentId === agentId)
            .filter(r => r.status === "Completed")
            .reduce(
                (sum, c) => sum + parseFloat(c.commissionAmount || 0),
                0
            );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'pending':
                return 'bg-primary-50 text-amber-800 border-amber-300';
            case 'denied':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const toggleSection = (sectionName) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };

    const togglePaidCheckmark = (payoutId) => {
        setPaidCheckmarks(prev => ({
            ...prev,
            [payoutId]: !prev[payoutId]
        }));
    };

    // Get unique agents from bookings and payout requests
    const getAgentSummary = () => {
        const agentMap = new Map();

        // Process bookings to get commission data
        bookingsRequests.forEach(booking => {
            if (booking.agentId) {
                if (!agentMap.has(booking.agentId)) {
                    agentMap.set(booking.agentId, {
                        agentId: booking.agentId,
                        name: booking.agent?.name || 'Unknown Agent',
                        email: booking.agent?.email || '-',
                        totalBookings: 0,
                        availableBalance: 0
                    });
                }

                const agent = agentMap.get(booking.agentId);
                if (booking.status === 'Completed') {
                    agent.totalBookings += 1;
                    agent.availableBalance += parseFloat(booking.commissionAmount || 0);
                }
            }
        });

        // Subtract approved/paid payouts from available balance
        payoutRequests.forEach(payout => {
            if (payout.agentId && (payout.status === 'approved' || payout.status === 'completed')) {
                const agent = agentMap.get(payout.agentId);
                if (agent) {
                    agent.availableBalance -= parseFloat(payout.approvedAmount || 0);
                }
            }
        });

        return Array.from(agentMap.values()).sort((a, b) => b.availableBalance - a.availableBalance);
    };

    const pendingRequests = payoutRequests.filter(r => r.status === 'processing' || r.status === 'pending');
    const approvedRequests = payoutRequests.filter(r => r.status === 'approved' || r.status === 'completed');
    const processedRequests = payoutRequests.filter(r => r.status === 'completed' || r.status === 'denied' || r.status === 'approved');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
                    <p className="text-amber-700">Loading payout requests...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <p className="text-red-800 font-semibold mb-2">Error loading data</p>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => {
                        fetchPayoutRequests();
                        fetchStats();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div >
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-amber-950">Payout Management</h1>
                    <p className="text-sm sm:text-base text-amber-700">Review and process agent payout requests</p>
                </div>
                <button
                    onClick={() => {
                        fetchPayoutRequests();
                        fetchStats();
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-primary-400 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Refresh
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="text-xs sm:text-sm opacity-90">Commissions</span>
                    </div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">¢{stats.totalCommissions.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="text-xs sm:text-sm opacity-90">Pending Amount</span>
                    </div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                        ¢{stats.pendingCommissions.toFixed(2)}
                    </p>
                </div>

                <div className="bg-white border-2 border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
                        <span className="text-xs sm:text-sm text-amber-700">Total Commissions Paid</span>
                    </div>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-950">¢{stats.paidCommissions.toFixed(2)}</p>
                </div>
            </div>

            {/* Agent Summary Table */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-primary-50 overflow-hidden">
                <button
                    onClick={() => toggleSection('agentSummary')}
                    className="w-full bg-gradient-to-r from-gray-50 to-orange-50 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-amber-200 flex justify-between items-center hover:from-gray-100 hover:to-orange-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-amber-950">Agent Summary</h2>
                    </div>
                    {expandedSections.agentSummary ? (
                        <ChevronsUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                    )}
                </button>
                {expandedSections.agentSummary && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead className="bg-gray-50 border-b-2 border-amber-200">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Agent Name</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Email</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Total Bookings</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Available Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-50">
                                {getAgentSummary().length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-amber-600">
                                            No agent data available
                                        </td>
                                    </tr>
                                ) : (
                                    getAgentSummary().map((agent) => (
                                        <tr key={agent.agentId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-amber-950">
                                                {agent.name}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-amber-900">
                                                {agent.email}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-amber-900">
                                                {agent.totalBookings}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-secondary-500">
                                                ¢{agent.availableBalance.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-primary-50 overflow-hidden">
                <button
                    onClick={() => toggleSection('pendingRequests')}
                    className="w-full bg-gradient-to-r from-gray-50 to-orange-50 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-amber-200 flex justify-between items-center hover:from-gray-100 hover:to-orange-100 transition-colors"
                >
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-amber-950">Pending Requests</h2>
                    {expandedSections.pendingRequests ? (
                        <ChevronsUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                    )}
                </button>
                {expandedSections.pendingRequests && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-gray-50 border-b-2 border-amber-200">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Request ID</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Agent</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Requested Amount</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Available Balance</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Description</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Date</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-50">
                                {pendingRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-amber-600">
                                            No pending payout requests
                                        </td>
                                    </tr>
                                ) : (
                                    pendingRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-amber-950">
                                                PR-{request.id.slice(0, 8)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-amber-950">
                                                        {request.agent?.name || 'Unknown Agent'}
                                                    </p>
                                                    <p className="text-xs text-amber-900">
                                                        {request.agent?.email || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-amber-900">
                                                ¢{parseFloat(request.requestedAmount).toFixed(2)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-amber-900">
                                                ¢{parseFloat(availableBalance(request.agentId) || 0).toFixed(2)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-amber-900 max-w-xs truncate">
                                                {request.description || '-'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-amber-900">
                                                {new Date(request.requestDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex gap-1 sm:gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setActionType('approve');
                                                        }}
                                                        className="p-1.5 sm:p-2 bg-blue-100 text-amber-900 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setActionType('modify');
                                                            setModifiedAmount(request.requestedAmount.toString());
                                                        }}
                                                        className="p-1.5 sm:p-2 bg-primary-50 text-amber-900 rounded-lg hover:bg-amber-200 transition-colors"
                                                        title="Modify Amount"
                                                    >
                                                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(request);
                                                            setActionType('deny');
                                                        }}
                                                        className="p-1.5 sm:p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Deny"
                                                    >
                                                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approved Payouts - Payment Confirmation */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-primary-50 overflow-hidden">
                <button
                    onClick={() => toggleSection('approvedPayouts')}
                    className="w-full bg-gradient-to-r from-gray-50 to-orange-50 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-amber-200 flex justify-between items-center hover:from-gray-100 hover:to-orange-100 transition-colors"
                >
                    <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-amber-950">Approved Payouts - Payment Confirmation</h2>
                    {expandedSections.approvedPayouts ? (
                        <ChevronsUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                    )}
                </button>
                {expandedSections.approvedPayouts && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 border-b-2 border-amber-200">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Request ID</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Agent</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Approved Amount</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Approved Date</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Admin Note</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-amber-900">Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-50">
                                {approvedRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-3 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-amber-600">
                                            No approved payouts
                                        </td>
                                    </tr>
                                ) : (
                                    approvedRequests.map((request) => (
                                        <tr key={request.id} className={`hover:bg-gray-50 transition-colors ${paidCheckmarks[request.id] ? 'bg-green-50' : ''}`}>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-amber-950">
                                                PR-{request.id.slice(0, 8)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-amber-950">
                                                        {request.agent?.name || 'Unknown Agent'}
                                                    </p>
                                                    <p className="text-xs text-amber-900">
                                                        {request.agent?.email || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-secondary-500">
                                                ¢{parseFloat(request.approvedAmount || request.requestedAmount).toFixed(2)}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-amber-900">
                                                {request.processedDate ? new Date(request.processedDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-amber-900 max-w-xs">
                                                {request.adminNote || '-'}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={paidCheckmarks[request.id] || false}
                                                        onChange={() => togglePaidCheckmark(request.id)}
                                                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                                    />
                                                    <span className="text-xs sm:text-sm text-amber-900">
                                                        {paidCheckmarks[request.id] ? 'Paid ✓' : 'Mark as Paid'}
                                                    </span>
                                                </label>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Processed Requests History */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-primary-50 overflow-hidden">
                <button
                    onClick={() => toggleSection('requestHistory')}
                    className="w-full bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-4 border-b-2 border-amber-200 flex justify-between items-center hover:from-gray-100 hover:to-orange-100 transition-colors"
                >
                    <h2 className="text-xl font-bold text-amber-950">Request History</h2>
                    {expandedSections.requestHistory ? (
                        <ChevronsUpIcon className="w-5 h-5 text-amber-950" />
                    ) : (
                        <ChevronDownIcon className="w-5 h-5 text-amber-950" />
                    )}
                </button>
                {expandedSections.requestHistory && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-amber-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Request ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Agent</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Requested</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Processed</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">Admin Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-50">
                                {processedRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-amber-600">
                                            No processed requests yet
                                        </td>
                                    </tr>
                                ) : (
                                    processedRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-amber-950">
                                                PR-{request.id.slice(0, 8)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-amber-950">
                                                        {request.agent?.name || 'Unknown Agent'}
                                                    </p>
                                                    <p className="text-xs text-amber-900">
                                                        {request.agent?.email || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-bold text-amber-900">
                                                        ¢{parseFloat(request.requestedAmount).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-amber-900">
                                                        {new Date(request.requestDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    {request.approvedAmount && (
                                                        <p className="text-sm font-bold text-amber-900">
                                                            ¢{parseFloat(request.approvedAmount).toFixed(2)}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-amber-900">
                                                        {request.processedDate ? new Date(request.processedDate).toLocaleDateString() : '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(request.status)}`}>
                                                    {request.status === 'approved' && <CheckCircle className="w-4 h-4" />}
                                                    {request.status === 'denied' && <XCircle className="w-4 h-4" />}
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-amber-900 max-w-xs">
                                                {request.adminNote || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className={`px-6 py-4 rounded-t-2xl ${actionType === 'approve' ? 'bg-gradient-to-r from-secondary-500 to-primary-400' :
                            actionType === 'deny' ? 'bg-gradient-to-r from-red-700 to-red-600' :
                                'bg-gradient-to-r from-amber-700 to-amber-600'
                            }`}>
                            <h3 className="text-xl font-bold text-white">
                                {actionType === 'approve' ? 'Approve Payout' :
                                    actionType === 'deny' ? 'Deny Payout' :
                                        'Modify Payout Amount'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-amber-200">
                                <p className="text-sm text-amber-700 mb-1">Agent</p>
                                <p className="font-semibold text-amber-950">
                                    {selectedRequest.agent?.name || 'Unknown Agent'}
                                </p>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                <p className="text-sm text-secondary-500 mb-1">Requested Amount</p>
                                <p className="text-2xl font-bold text-secondary-500">
                                    ¢{parseFloat(selectedRequest.requestedAmount).toFixed(2)}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-amber-200">
                                <p className="text-sm text-amber-700 mb-1">Available Balance</p>
                                <p className="text-xl font-bold text-amber-950">
                                    ¢{parseFloat(availableBalance(selectedRequest.agentId) || 0).toFixed(2)}
                                </p>
                            </div>

                            {actionType === 'modify' && (
                                <div>
                                    <label className="block text-sm font-semibold text-amber-900 mb-2">
                                        New Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={modifiedAmount}
                                        onChange={(e) => setModifiedAmount(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-primary-400 outline-none"
                                        max={selectedRequest.availableBalance}
                                        step="0.01"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-amber-900 mb-2">
                                    Admin Note {actionType === 'deny' && <span className="text-red-600">*</span>}
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Add a note about this decision..."
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-primary-400 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setActionType(null);
                                        setAdminNote('');
                                        setModifiedAmount('');
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-amber-300 text-amber-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-colors ${actionType === 'approve' ? 'bg-secondary-500 hover:bg-primary-400' :
                                        actionType === 'deny' ? 'bg-red-700 hover:bg-red-600' :
                                            'bg-amber-700 hover:bg-amber-600'
                                        }`}
                                >
                                    {actionType === 'approve' ? 'Approve' :
                                        actionType === 'deny' ? 'Deny' :
                                            'Modify & Approve'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}