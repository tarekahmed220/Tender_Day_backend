// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     const queryObj = { ...this.queryString };
//     const excludeFields = ["page", "sort", "limit", "fields", "search"];
//     excludeFields.forEach((el) => delete queryObj[el]);

//     let customQuery = {};

//     if (queryObj.addingFrom || queryObj.addingTo) {
//       customQuery.createdAt = {};

//       if (queryObj.addingFrom) {
//         const fromDate = new Date(queryObj.addingFrom);
//         if (isNaN(fromDate)) {
//           throw new Error("Invalid addingFrom date format");
//         }
//         fromDate.setHours(0, 0, 0, 0);
//         customQuery.createdAt.$gte = fromDate;
//       }

//       if (queryObj.addingTo) {
//         const toDate = new Date(queryObj.addingTo);
//         if (isNaN(toDate)) {
//           throw new Error("Invalid addingTo date format");
//         }
//         toDate.setHours(23, 59, 59, 999);
//         customQuery.createdAt.$lte = toDate;
//       }

//       if (
//         customQuery.createdAt.$gte &&
//         customQuery.createdAt.$lte &&
//         customQuery.createdAt.$gte > customQuery.createdAt.$lte
//       ) {
//         const temp = customQuery.createdAt.$gte;
//         customQuery.createdAt.$gte = customQuery.createdAt.$lte;
//         customQuery.createdAt.$lte = temp;
//       }

//       console.log("Date filter:", customQuery.createdAt);

//       delete queryObj.addingFrom;
//       delete queryObj.addingTo;
//     }

//     if (queryObj.startDate || queryObj.endDate) {
//       customQuery.subscriptionPaymentDate = {};
//       if (queryObj.startDate) {
//         const startDate = new Date(queryObj.startDate);
//         startDate.setHours(0, 0, 0, 0);
//         customQuery.subscriptionPaymentDate.$gte = startDate;
//       }
//       if (queryObj.endDate) {
//         const endDate = new Date(queryObj.endDate);
//         endDate.setHours(23, 59, 59, 999);
//         customQuery.subscriptionPaymentDate.$lte = endDate;
//       }
//       delete queryObj.startDate;
//       delete queryObj.endDate;
//     }

//     if (queryObj.subscriptionStatus) {
//       customQuery.subscriptionStatus = queryObj.subscriptionStatus;
//     }

//     if (queryObj.country) {
//       customQuery.country = queryObj.country;
//     }

//     // دمج الـ customQuery مع الـ queryObj
//     Object.keys(queryObj).forEach((key) => {
//       customQuery[key] = queryObj[key];
//     });

//     // تطبيق الفلترة مباشرة
//     this.query = this.query.find(customQuery);
//     return this;
//   }

//   search() {
//     if (this.queryString.search && this.queryString.search.trim() !== "") {
//       const searchRegex = new RegExp(this.queryString.search, "i");
//       this.query = this.query.find({
//         $or: [
//           { name_ar: searchRegex },
//           { name_en: searchRegex },
//           { name: searchRegex },
//           { email: searchRegex },
//           { tenderNumber: searchRegex },
//           { phone: searchRegex },
//           { address: searchRegex },
//         ],
//       });
//     }
//     return this;
//   }

//   sort() {
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(",").join(" ");
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort("-createdAt");
//     }
//     return this;
//   }

//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(",").join(" ");
//       this.query = this.query.select(fields);
//     } else {
//       this.query = this.query.select("-__v -password");
//     }
//     return this;
//   }

//   paginate() {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 10;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);
//     return this;
//   }
// }

// export default APIFeatures;
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields", "search"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let customQuery = {};

    // ✅ التعامل مع فلترة التواريخ (بغض النظر عن الترتيب)
    if (queryObj.addingFrom || queryObj.addingTo) {
      let fromDate = queryObj.addingFrom ? new Date(queryObj.addingFrom) : null;
      let toDate = queryObj.addingTo ? new Date(queryObj.addingTo) : null;

      if (fromDate && isNaN(fromDate)) {
        throw new Error("Invalid addingFrom date format");
      }
      if (toDate && isNaN(toDate)) {
        throw new Error("Invalid addingTo date format");
      }

      if (fromDate && toDate && fromDate > toDate) {
        // إذا كان `addingFrom` أكبر من `addingTo` يتم تبديلهما
        [fromDate, toDate] = [toDate, fromDate];
      }

      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        customQuery.createdAt = { $gte: fromDate };
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        customQuery.createdAt = {
          ...(customQuery.createdAt || {}),
          $lte: toDate,
        };
      }

      console.log("📌 تاريخ البحث:", customQuery.createdAt);

      delete queryObj.addingFrom;
      delete queryObj.addingTo;
    }

    // ✅ فلترة `subscriptionPaymentDate`
    if (queryObj.startDate || queryObj.endDate) {
      let startDate = queryObj.startDate ? new Date(queryObj.startDate) : null;
      let endDate = queryObj.endDate ? new Date(queryObj.endDate) : null;

      if (startDate && isNaN(startDate)) {
        throw new Error("Invalid startDate format");
      }
      if (endDate && isNaN(endDate)) {
        throw new Error("Invalid endDate format");
      }

      if (startDate && endDate && startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      customQuery.subscriptionPaymentDate = {};
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
        customQuery.subscriptionPaymentDate.$gte = startDate;
      }
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        customQuery.subscriptionPaymentDate.$lte = endDate;
      }

      delete queryObj.startDate;
      delete queryObj.endDate;
    }

    // ✅ فلترة حالة الاشتراك
    if (queryObj.subscriptionStatus) {
      customQuery.subscriptionStatus = queryObj.subscriptionStatus;
    }

    // ✅ فلترة الدولة
    if (queryObj.country) {
      customQuery.country = queryObj.country;
    }

    // دمج `customQuery` مع `queryObj`
    Object.keys(queryObj).forEach((key) => {
      customQuery[key] = queryObj[key];
    });

    // تطبيق الفلترة مباشرة
    this.query = this.query.find(customQuery);
    return this;
  }

  search() {
    if (this.queryString.search && this.queryString.search.trim() !== "") {
      const searchRegex = new RegExp(this.queryString.search, "i");
      this.query = this.query.find({
        $or: [
          { name_ar: searchRegex },
          { name_en: searchRegex },
          { name: searchRegex },
          { email: searchRegex },
          { tenderNumber: searchRegex },
          { phone: searchRegex },
          { address: searchRegex },
        ],
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v -password");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
