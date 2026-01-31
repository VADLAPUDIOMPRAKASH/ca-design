'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Plus,
  Filter,
  Download,
  X,
  Users,
  Copy,
  Phone,
} from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/lib/toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonClientCard, SkeletonTable } from '@/components/ui/Skeleton';

type SortField = 'name' | 'companyName' | 'addedDate';
type SortOrder = 'asc' | 'desc';

export default function ClientsPage() {
  const { clients, updateClient } = useApp();
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
  const [isLoading] = useState(false); // Simulate loading - set true for skeleton demo

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Clients</h1>
        <Link href="/clients/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus size={18} className="mr-2 shrink-0" />
            Add New Client
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card padding="sm" className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="shrink-0">
            <Filter size={18} className="mr-2 shrink-0" />
            Filters
            {showFilters && <X size={18} className="ml-2 shrink-0" />}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                <div className="space-y-2">
                  {['Individual', 'Company', 'Startup', 'Partnership'].map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleCategoryFilter(cat)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-text-primary">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                <div className="space-y-2">
                  {['Active', 'Inactive', 'Pending'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-text-primary">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
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
        <Card padding="sm" className="mb-3 bg-primary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm font-medium text-text-primary">
              {selectedClients.length} client(s) selected
            </p>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </Card>
      )}

      {/* Clients Table - Desktop */}
      <Card padding="none" className="hidden md:block">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} cols={7} />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-subtle border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left">
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
                  className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:bg-surface-subtle"
                  onClick={() => handleSort('name')}
                >
                  Client Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:bg-surface-subtle"
                  onClick={() => handleSort('companyName')}
                >
                Company {sortField === 'companyName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Phone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th
                  className="px-4 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:bg-surface-subtle"
                  onClick={() => handleSort('addedDate')}
                >
                  Added Date {sortField === 'addedDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8">
                    <EmptyState
                      icon={Users}
                      title={searchQuery || filters.categories.length > 0 || filters.statuses.length > 0 ? 'No clients found' : 'No clients yet'}
                      description={
                        searchQuery || filters.categories.length > 0 || filters.statuses.length > 0
                          ? 'Try adjusting your search or filters to find what you\'re looking for.'
                          : 'Add your first client to get started managing your CA practice.'
                      }
                      actionLabel={!searchQuery && filters.categories.length === 0 && filters.statuses.length === 0 ? 'Add New Client' : undefined}
                      actionHref={!searchQuery && filters.categories.length === 0 && filters.statuses.length === 0 ? '/clients/add' : undefined}
                    />
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClientSelection(client.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm mr-2">
                          {client.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-text-primary">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-text-primary">{client.companyName}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-primary">{client.email}</span>
                        <button
                          onClick={() => copyToClipboard(client.email)}
                          className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy email"
                        >
                          <Copy size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${client.phone}`}
                          className="text-sm text-text-primary hover:text-primary flex items-center gap-1"
                        >
                          <Phone size={14} />
                          {client.phone}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-2">
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
                    <td className="px-4 py-2">
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
                    <td className="px-4 py-2 text-sm text-text-primary">
                      {format(new Date(client.addedDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="outline" size="sm">
                          More
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {!isLoading && paginatedClients.length > 0 && (
          <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-text-muted">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-surface"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-text-muted">
                of {filteredClients.length} clients
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-text-muted shrink-0">
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

      {/* Mobile Card View + Pagination */}
      <div className="md:hidden mt-4">
        <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <SkeletonClientCard key={i} />
            ))}
          </>
        ) : (
          paginatedClients.map((client) => (
            <Card key={client.id} className="animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{client.name}</p>
                    <p className="text-sm text-text-muted">{client.companyName}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  client.status === 'Active' ? 'bg-success/10 text-success' : 'bg-surface-subtle text-text-muted'
                }`}>
                  {client.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-text-muted mb-4">
                <p>{client.email}</p>
                <p>{client.phone}</p>
              </div>
              <Link href={`/clients/${client.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full">More</Button>
              </Link>
            </Card>
          ))
        )}
        </div>
        {/* Mobile Pagination */}
        {!isLoading && paginatedClients.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-initial"
              >
                Previous
              </Button>
              <span className="text-sm text-text-muted shrink-0">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex-1 sm:flex-initial"
              >
                Next
              </Button>
            </div>
            <p className="text-center text-xs text-text-muted">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
