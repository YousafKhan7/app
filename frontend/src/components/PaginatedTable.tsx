/**
 * Reusable paginated table component with search functionality
 */
import  { useState } from 'react';
import { Table, Input, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Search } = Input;

interface PaginatedTableProps<T> extends Omit<TableProps<T>, 'dataSource' | 'pagination'> {
  data: T[];
  total: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  currentPage: number;
  pageSize: number;
}

function PaginatedTable<T extends Record<string, any>>({
  data,
  total,
  loading,
  onPageChange,
  onSearch,
  searchPlaceholder = "Search...",
  showSearch = true,
  currentPage,
  pageSize,
  ...tableProps
}: PaginatedTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  const handlePageChange = (page: number, size?: number) => {
    onPageChange(page, size || pageSize);
  };

  return (
    <Card>
      {showSearch && (
        <div className="mb-4">
          <Search
            placeholder={searchPlaceholder}
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
            style={{ maxWidth: 400 }}
          />
        </div>
      )}
      
      <Table
        {...tableProps}
        dataSource={data}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
}

export default PaginatedTable;
