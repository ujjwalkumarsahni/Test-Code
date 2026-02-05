// import mongoose from 'mongoose';

// const bookItemSchema = new mongoose.Schema({
//   bookId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Book'
//   },
//   bookName: {
//     type: String,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   unitPrice: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   totalPrice: {
//     type: Number,
//     min: 0,
//     default: 0
//   },
//   program: {
//     type: String,
//     enum: ['ELP', 'LTE', 'CAC', 'CTF']
//   },
//   grade: {
//     type: String
//   }
// });

// const kitItemSchema = new mongoose.Schema({
//   kitType: {
//     type: String,
//     enum: ['Wonder Kit', 'Nexus Kit', 'Individual'],
//     required: true
//   },
//   kitName: {
//     type: String,
//     required: function() {
//       return this.kitType === 'Individual';
//     }
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   unitPrice: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   totalPrice: {
//     type: Number,
//     min: 0,
//     default: 0
//   }
// });

// const orderSchema = new mongoose.Schema({
//   invoiceNumber: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   schoolId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'School',
//     required: true
//   },
//   schoolName: {
//     type: String,
//     required: true
//   },
//   books: [bookItemSchema],
//   kits: [kitItemSchema],
//   discount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   subtotal: {
//     type: Number,
//     min: 0,
//     default: 0
//   },
//   totalAfterDiscount: {
//     type: Number,
//     min: 0,
//     default: 0
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'paid', 'unpaid'],
//     default: 'pending'
//   },
//   dispatchStatus: {
//     type: String,
//     enum: ['pending', 'dispatched', 'delivered'],
//     default: 'pending'
//   },
//   dispatchedAt: {
//     type: Date
//   },
//   invoiceDetails: {
//     from: {
//       name: String,
//       address: String,
//       contact: String
//     },
//     to: {
//       name: String,
//       address: String,
//       contact: String
//     },
//     notes: String
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // REMOVE the pre-save middleware completely
// // OR fix it like this:

// // Option 1: Remove middleware completely and handle calculations in controller
// // Option 2: Keep this simple middleware if needed

// const Order = mongoose.model('Order', orderSchema);
// export default Order;



import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  bookType: {
    type: String,
    enum: ['ELP', 'LTE', 'CAC', 'CTF'],
    required: true
  },
  grade: {
    type: String,
    enum: ['Pre-Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9-12'],
    required: function() {
      return this.bookType !== 'ELP' || (this.bookName && this.isIndividualBook);
    }
  },
  bookName: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  isIndividualBook: {
    type: Boolean,
    default: false
  },
  isComboPack: {
    type: Boolean,
    default: false
  }
});

const kitItemSchema = new mongoose.Schema({
  kitType: {
    type: String,
    enum: ['Wonder Kit', 'Nexus Kit', 'Individual Kit'],
    required: true
  },
  kitName: {
    type: String,
    trim: true,
    required: function() {
      return this.kitType === 'Individual Kit';
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    default: function() {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      return `${currentYear}-${nextYear}`;
    }
  },
  orderItems: [orderItemSchema],
  kitItems: [kitItemSchema],
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial'],
    default: 'pending'
  },
  dispatchStatus: {
    type: String,
    enum: ['pending', 'processing', 'dispatched', 'delivered'],
    default: 'pending'
  },
  toAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    mobile: String,
    email: String
  },
  fromAddress: {
    name: {
      type: String,
      default: 'TechCraft Education'
    },
    address: {
      type: String,
      default: '123, Tech Street, Innovation City'
    },
    city: {
      type: String,
      default: 'Tech City'
    },
    state: {
      type: String,
      default: 'Delhi'
    },
    pincode: {
      type: String,
      default: '110001'
    },
    mobile: {
      type: String,
      default: '9876543210'
    },
    email: {
      type: String,
      default: 'info@techcraftedu.com'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dispatchedAt: Date,
  dispatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

// Generate invoice number before save
orderSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const school = await mongoose.model('School').findById(this.school);
    const schoolPrefix = school.name.substring(0, 4).toUpperCase();
    const year = this.academicYear.split('-')[0];
    
    // Get count of orders for this school in this academic year
    const count = await mongoose.model('Order').countDocuments({
      school: this.school,
      academicYear: this.academicYear
    });
    
    this.invoiceNumber = `${schoolPrefix}/${year}/${count + 1}`;
  }
  
  // Calculate totals
  const orderItemsTotal = this.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const kitItemsTotal = this.kitItems.reduce((sum, item) => sum + item.totalPrice, 0);
  this.subtotal = orderItemsTotal + kitItemsTotal;
  this.totalAmount = this.subtotal - this.discount;
  
  // next();
});

// Virtual for isEditable
orderSchema.virtual('isEditable').get(function() {
  return this.dispatchStatus === 'pending' || this.dispatchStatus === 'processing';
});

// Indexes
orderSchema.index({ school: 1 });
orderSchema.index({ invoiceNumber: 1 });
orderSchema.index({ academicYear: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ dispatchStatus: 1 });
orderSchema.index({ createdBy: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;