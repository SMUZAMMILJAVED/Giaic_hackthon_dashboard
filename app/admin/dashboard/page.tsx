"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { FiLogOut, FiChevronDown, FiChevronUp, FiTrash2, FiTruck, FiCheckCircle } from "react-icons/fi";

interface Order {
  _id: string;
  orderId: string;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }[];
  billingInfo: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  totalAmount: number;
  status: string;
  _createdAt: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          orderId,
          items[]{
            productId,
            title,
            price,
            quantity
          },
          billingInfo {
            fullName,
            email,
            address,
            city,
            zipCode
          },
          totalAmount,
          status,
          _createdAt
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2563eb",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      Swal.fire("Updated!", "Order status has been updated.", "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Something went wrong while updating the status.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.replace("/");
  };

  const statusColors = {
    Placed: "bg-yellow-100 text-yellow-800",
    Shipped: "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-2xl font-bold text-red-600">Admin Dashboard</h1>
              
              <div className="hidden md:flex items-center space-x-4">
                {["All", "Placed", "Shipped", "Delivered", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      filter === status 
                        ? "bg-red-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>

            <div className="md:hidden pb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["All", "Placed", "Shipped", "Delivered", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
                      filter === status
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">#{order.orderId}</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.billingInfo.fullName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.totalAmount}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order._createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="hidden md:block">
                      {selectedOrderId === order._id ? (
                        <FiChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {selectedOrderId === order._id && (
                  <div className="border-t border-gray-200 p-4 animate-fadeIn">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>
                        <div className="text-sm text-gray-700">
                          <p>{order.billingInfo.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-900">Shipping Address</h3>
                        <div className="text-sm text-gray-700">
                          <p>{order.billingInfo.address}</p>
                          <p>{order.billingInfo.city}, {order.billingInfo.zipCode}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-900">Actions</h3>
                        <div className="flex items-center space-x-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="block w-full py-1.5 pl-3 pr-8 text-sm border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order._id);
                            }}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Order Items</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-gray-100 rounded-full">
                  <FiTruck className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">Try changing your filter settings</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}