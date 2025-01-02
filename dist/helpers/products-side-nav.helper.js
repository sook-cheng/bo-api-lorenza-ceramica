"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRecordForTableName = exports.addSubRecordForTableName = exports.updateRecordForTableName = exports.createRecordForTableName = void 0;
const bo_functions_1 = require("../bo-functions");
const createRecordForTableName = async (fastify, connection, data) => {
    let result;
    switch (data.tableName) {
        case 'categories':
            let mainCategoryId = null;
            if (data.mainSideNavId) {
                const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.mainSideNavId]);
                if (categories && categories.length > 0)
                    mainCategoryId = categories[0].id;
            }
            result = await (0, bo_functions_1.createCategory)(fastify, {
                name: data.name,
                description: data.name,
                mainCategoryId,
            });
            break;
        case 'colors':
            if (data.mainSideNavId)
                result = await (0, bo_functions_1.createColor)(fastify, {
                    name: data.name,
                    value: data.name,
                });
            break;
        case 'finishes':
            if (data.mainSideNavId)
                result = await (0, bo_functions_1.createFinish)(fastify, {
                    name: data.name,
                    value: data.name,
                });
            break;
        case 'sizes':
            if (data.mainSideNavId)
                result = await (0, bo_functions_1.createSize)(fastify, {
                    name: data.name.replaceAll(' ', ''),
                    value: data.name,
                });
            break;
        case 'tags':
            let mainTagId = null;
            if (data.mainSideNavId) {
                const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.mainSideNavId]);
                if (tags && tags.length > 0)
                    mainTagId = tags[0].id;
            }
            result = await (0, bo_functions_1.createTag)(fastify, {
                name: data.name,
                value: data.name,
                mainTagId,
            });
            break;
    }
    return result;
};
exports.createRecordForTableName = createRecordForTableName;
const updateRecordForTableName = async (fastify, connection, data) => {
    let result;
    switch (data.tableName) {
        case 'categories':
            const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            const [mainCategories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE mainSideNavId=?)', [data.mainSideNavId || null]);
            if (categories && categories.length > 0)
                result = await (0, bo_functions_1.updateCategory)(fastify, {
                    id: categories[0].id,
                    name: data.name,
                    description: data.name,
                    mainCategoryId: mainCategories && mainCategories.length > 0 ? mainCategories[0].id : null,
                });
            break;
        case 'colors':
            const [colors] = await connection.query('SELECT id FROM colors WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (colors && colors.length > 0)
                result = await (0, bo_functions_1.updateColor)(fastify, {
                    id: colors[0].id,
                    name: data.name,
                    value: data.name,
                });
            break;
        case 'finishes':
            const [finishes] = await connection.query('SELECT id FROM finishes WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (finishes && finishes.length > 0)
                result = await (0, bo_functions_1.updateFinish)(fastify, {
                    id: finishes[0].id,
                    name: data.name,
                    value: data.name,
                });
            break;
        case 'sizes':
            const [sizes] = await connection.query('SELECT id FROM sizes WHERE value IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (sizes && sizes.length > 0)
                result = await (0, bo_functions_1.updateSize)(fastify, {
                    id: sizes[0].id,
                    name: data.name.replaceAll(' ', ''),
                    value: data.name,
                });
            break;
        case 'tags':
            const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            const [mainTags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE mainSideNavId=?)', [data.mainSideNavId || null]);
            if (tags && tags.length > 0)
                result = await (0, bo_functions_1.updateTag)(fastify, {
                    id: tags[0].id,
                    name: data.name,
                    value: data.name,
                    mainTagId: mainTags && mainTags.length > 0 ? mainTags[0].id : null,
                });
            break;
    }
    return result;
};
exports.updateRecordForTableName = updateRecordForTableName;
const addSubRecordForTableName = async (fastify, connection, data) => {
    let result;
    switch (data.tableName) {
        case 'categories':
            const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (categories && categories.length > 0) {
                const subCategories = data.subSideNavs && data.subSideNavs.length > 0
                    ? data.subSideNavs.map((x) => {
                        return {
                            name: x.name,
                            description: x.name,
                        };
                    })
                    : [];
                result = await (0, bo_functions_1.addSubCategories)(fastify, {
                    mainCategoryId: categories[0].id,
                    subCategories,
                });
            }
            break;
        case 'colors':
            const colors = data.subSideNavs && data.subSideNavs.length > 0
                ? data.subSideNavs.map((x) => {
                    return {
                        name: x.name,
                        value: x.name,
                    };
                })
                : [];
            result = await (0, bo_functions_1.createColors)(fastify, { colors });
            break;
        case 'finishes':
            const finishes = data.subSideNavs && data.subSideNavs.length > 0
                ? data.subSideNavs.map((x) => {
                    return {
                        name: x.name,
                        value: x.name,
                    };
                })
                : [];
            result = await (0, bo_functions_1.createFinishes)(fastify, { finishes });
            break;
        case 'sizes':
            const sizes = data.subSideNavs && data.subSideNavs.length > 0
                ? data.subSideNavs.map((x) => {
                    return {
                        name: x.name.replaceAll(' ', ''),
                        value: x.name,
                    };
                })
                : [];
            result = await (0, bo_functions_1.createSizes)(fastify, { sizes });
            break;
        case 'tags':
            const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (tags && tags.length > 0) {
                const subTags = data.subSideNavs && data.subSideNavs.length > 0
                    ? data.subSideNavs.map((x) => {
                        return {
                            name: x.name,
                            value: x.name,
                        };
                    })
                    : [];
                result = await (0, bo_functions_1.addSubTags)(fastify, {
                    mainTagId: tags[0].id,
                    subTags,
                });
            }
            break;
    }
    return result;
};
exports.addSubRecordForTableName = addSubRecordForTableName;
const removeRecordForTableName = async (fastify, connection, data) => {
    let result;
    switch (data.tableName) {
        case 'categories':
            const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (categories && categories.length > 0)
                result = await (0, bo_functions_1.deleteCategory)(fastify, categories[0].id);
            break;
        case 'colors':
            const [colors] = await connection.query('SELECT id FROM colors WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (colors && colors.length > 0)
                result = await (0, bo_functions_1.deleteColor)(fastify, colors[0].id);
            break;
        case 'finishes':
            const [finishes] = await connection.query('SELECT id FROM finishes WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (finishes && finishes.length > 0)
                result = await (0, bo_functions_1.deleteFinish)(fastify, finishes[0].id);
            break;
        case 'sizes':
            const [sizes] = await connection.query('SELECT id FROM sizes WHERE value IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (sizes && sizes.length > 0)
                result = await (0, bo_functions_1.deleteSize)(fastify, sizes[0].id);
            break;
        case 'tags':
            const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (tags && tags.length > 0)
                result = await (0, bo_functions_1.deleteTag)(fastify, tags[0].id);
            break;
    }
    return result;
};
exports.removeRecordForTableName = removeRecordForTableName;
//# sourceMappingURL=products-side-nav.helper.js.map