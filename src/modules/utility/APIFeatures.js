// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     const queryObj = { ...this.queryString };
//     const excludeFields = ["page", "sort", "limit", "fields", "search"];
//     excludeFields.forEach((el) => delete queryObj[el]);

//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     this.query = this.query.find(JSON.parse(queryStr));
//     return this;
//   }

//   search() {
//     if (this.queryString.search) {
//       const searchRegex = new RegExp(this.queryString.search, "i");
//       this.query = this.query.find({
//         $or: [
//           { name_ar: searchRegex },
//           { name_en: searchRegex },
//           { phone: searchRegex },
//           { email: searchRegex },
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
//       this.query = this.query.select("-__v");
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
// utility/apiFeatures.js
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields", "search"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // التعامل مع فلترة مدة الاشتراك (subscriptionPaymentDate و subscriptionExpiryDate)
    if (queryObj.startDate || queryObj.endDate) {
      queryObj.subscriptionPaymentDate = {};
      if (queryObj.startDate) {
        queryObj.subscriptionPaymentDate.$gte = new Date(queryObj.startDate);
      }
      if (queryObj.endDate) {
        queryObj.subscriptionPaymentDate.$lte = new Date(queryObj.endDate);
      }
      delete queryObj.startDate;
      delete queryObj.endDate;
    }

    // فلترة بحالة الاشتراك
    if (queryObj.subscriptionStatus) {
      queryObj.subscriptionStatus = queryObj.subscriptionStatus;
    }

    // فلترة بالدولة
    if (queryObj.country) {
      queryObj.country = queryObj.country;
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search() {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, "i");
      this.query = this.query.find({
        $or: [
          { name: searchRegex }, // البحث باسم العميل
          { email: searchRegex }, // البحث بالإيميل
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
      this.query = this.query.select("-__v -password"); // استبعاد الباسورد والـ __v
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
