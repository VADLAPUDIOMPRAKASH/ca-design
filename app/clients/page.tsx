'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Trash2,
  Mail,
  Download,
  X,
  Users,
  Copy,
  Phone,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';

type SortField = 'name' | 'companyName' | 'addedDate';
type SortOrder = 'asc' | 'desc';

export default function ClientsPage() {
  const router = useRouter();
  const { clients, deleteClient, updateClient } = useApp();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('addedDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState({
    categories: [] as string[],
    statuses: [] as string[],
    dateFrom: '',
    dateTo: '',
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === 'Active').length;
    const inactive = clients.filter((c) => c.status === 'Inactive').length;
    const thisMonth = clients.filter((c) => {
      const date = new Date(c.addedDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return [
      { label: 'Total Clients', value: total.toString(), color: 'text-primary' },
      { label: 'Active', value: active.toString(), color: 'text-success' },
      { label: 'Inactive', value: inactive.toString(), color: 'text-secondary' },
      { label: 'Added This Month', value: thisMonth.toString(), color: 'text-warning' },
    ];
  }, [clients]);

  // Filter and search clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.companyName.toLowerCase().includes(query) ||
          client.phone.includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((client) =>
        client.categories.some((cat) => filters.categories.includes(cat))
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((client) => filters.statuses.includes(client.status));
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter((client) => new Date(client.addedDate) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((client) => new Date(client.addedDate) <= toDate);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'companyName':
          aVal = a.companyName.toLowerCase();
          bVal = b.companyName.toLowerCase();
          break;
        case 'addedDate':
          aVal = new Date(a.addedDate).getTime();
          bVal = new Date(b.addedDate).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [clients, searchQuery, filters, sortField, sortOrder]);

  // Pagination
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const toggleClientSelection = (id: number) => {
    setSelectedClients((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedClients.length === paginatedClients.length && paginatedClients.length > 0) {
      setSelectedClients([]);
    } else {
      setSelectedClients(paginatedClients.map((c) => c.id));
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
      showToast('Client deleted successfully', 'success');
      setSelectedClients((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedClients.length} client(s)?`)) {
      selectedClients.forEach((id) => deleteClient(id));
      showToast(`${selectedClients.length} client(s) deleted successfully`, 'success');
      setSelectedClients([]);
    }
  };

  const handleStatusToggle = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateClient(id, { status: newStatus as 'Active' | 'Inactive' });
    showToast(`Client status updated to ${newStatus}`, 'success');
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Company', 'Status', 'Added Date'].join(','),
      ...filteredClients.map((c) =>
        [
          c.name,
          c.email,
          c.phone,
          c.companyName,
          c.status,
          format(new Date(c.addedDate), 'yyyy-MM-dd'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    showToast('Clients exported successfully', 'success');
  };

  const toggleCategoryFilter = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      statuses: [],
      dateFrom: '',
      dateTo: '',
    });
    setSearchQuery('');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <Link href="/clients/add">
          <Button>
            <Plus size={18} className="mr-2" />
            Add New Client
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} className="mr-2" />
            Filters
            {showFilters && <X size={18} className="ml-2" />}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="space-y-2">
                  {['Individual', 'Company', 'Startup', 'Partnership'].map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleCategoryFilter(cat)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-2">
                  {['Active', 'Inactive', 'Pending'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <Card className="mb-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {selectedClients.length} client(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Clients Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedClients.length === paginatedClients.length &&
                      paginatedClients.length > 0
                    }
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Client Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('companyName')}
                >
                  Company {sortField === 'companyName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('addedDate')}
                >
                  Added Date {sortField === 'addedDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 text-lg font-medium mb-2">No clients found</p>
                      <p className="text-gray-400 text-sm mb-4">
                        {searchQuery || filters.categories.length > 0 || filters.statuses.length > 0
                          ? 'Try adjusting your filters'
                          : 'Get started by adding your first client'}
                      </p>
                      {!searchQuery && filters.categories.length === 0 && filters.statuses.length === 0 && (
                        <Link href="/clients/add">
                          <Button>
                            <Plus size={18} className="mr-2" />
                            Add New Client
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClientSelection(client.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                          {client.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{client.companyName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{client.email}</span>
                        <button
                          onClick={() => copyToClipboard(client.email)}
                          className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy email"
                        >
                          <Copy size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${client.phone}`}
                          className="text-sm text-gray-700 hover:text-primary flex items-center gap-1"
                        >
                          <Phone size={14} />
                          {client.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {client.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={client.status === 'Active'}
                          onChange={() => handleStatusToggle(client.id, client.status)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {format(new Date(client.addedDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/clients/${client.id}/login`}>
                          <Button variant="outline" size="sm">
                            Create Login
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-danger"
                          title="Delete client"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedClients.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">
                of {filteredClients.length} clients
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
