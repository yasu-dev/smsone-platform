import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SMSMessage } from '../../types';
import StatusBadge from '../ui/StatusBadge';

interface RecentMessagesProps {
  messages: SMSMessage[];
}

const RecentMessages: React.FC<RecentMessagesProps> = ({ messages }) => {
  return (
    <div className="card mt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-grey-900">最近のメッセージ</h3>
        <Link 
          to="/history" 
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
        >
          すべて表示
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      <div className="overflow-hidden border border-grey-200 rounded-lg">
        <table className="min-w-full divide-y divide-grey-200">
          <thead className="bg-grey-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                宛先
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                内容
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                送信日時
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                ステータス
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-grey-200">
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-grey-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-900">
                  {message.recipient}
                </td>
                <td className="px-6 py-4 text-sm text-grey-900 max-w-xs truncate">
                  {message.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                  {new Date(message.createdAt).toLocaleString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={message.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentMessages;