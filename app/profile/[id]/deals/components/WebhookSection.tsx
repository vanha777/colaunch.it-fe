import { useState, useEffect } from "react";
import { MdWebhook } from "react-icons/md";
import { FaPlus, FaTimes, FaGhost, FaPencilAlt, FaTrash } from "react-icons/fa";
import Alert from "@/components/Alert";
import { GameData } from "@/app/utils/AppContext";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function WebhookSection() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    events: [] as string[],
  });
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  useEffect(() => {
    const fetchWebhooks = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setWebhooks([
        {
          id: '1',
          url: 'https://api.example.com/webhook1',
          events: ['account.created', 'subscription.updated'],
          status: 'active',
          createdAt: '2024-03-20'
        },
        {
          id: '2',
          url: 'https://api.example.com/webhook2',
          events: ['transaction.completed'],
          status: 'inactive',
          createdAt: '2024-03-19'
        }
      ]);
    };

    fetchWebhooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Compact Header - Updated styling */}
      <div className="navbar bg-gray-50 text-black p-6">
        <div className="flex-1">
          <div className="bg-base-200 rounded-full px-8 py-4 shadow-lg flex items-center">
            <div className="text-xl">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold text-2xl">
                My Deals Hub
              </span>
              <p className="text-base text-gray-600 mt-2">{webhooks.length} active deals</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-base-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 text-gray-700"
        >
          <FaPlus className="text-sm" />
          Add Deals
        </button>
      </div>

      {/* Simplified Table - Updated styling */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-base-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-200/10 text-gray-600 text-sm font-medium">
            <div className="col-span-5">What Happened</div>
            <div className="col-span-4">Who To Call</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200/10">
            {webhooks.map(webhook => (
              <div key={webhook.id}
                className="grid grid-cols-12 gap-4 p-6 hover:bg-gray-100/50 group transition-all duration-200">
                <div className="col-span-4">
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map(event => (
                      <span key={event}
                        className={`px-3 py-1 text-sm font-medium rounded-full ${event.includes('created')
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : event.includes('updated')
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <MdWebhook className="text-xl text-blue-600" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-medium break-all">
                        {webhook.url}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        Created {new Date(webhook.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${webhook.status === 'active'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${webhook.status === 'active' ? 'bg-green' : 'bg-red-500'
                      } animate-pulse mr-2`}></span>
                    {webhook.status}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-all">
                      <FaPencilAlt className="text-gray-600 hover:text-gray-900 text-xs" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-full transition-all">
                      <FaTrash className="text-red-600 hover:text-red-700 text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State - Updated styling */}
        {webhooks.length === 0 && (
          <div className="text-center py-16 bg-base-200 rounded-3xl shadow-sm border border-gray-200/20">
            <FaGhost className="text-gray-400 text-5xl mx-auto mb-4" />
            <p className="text-gray-600 font-light">No webhook connections yet</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-base-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 text-gray-700"
            >
              Add your first webhook
            </button>
          </div>
        )}
      </div>

      {/* Modal remains unchanged */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          {/* ... existing modal code ... */}
        </div>
      )}

      <Alert
        isOpen={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
} 