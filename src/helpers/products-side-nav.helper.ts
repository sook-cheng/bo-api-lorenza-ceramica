import { FastifyInstance } from "fastify";
import { addSubCategories, addSubTags, createCategory, createColor, createColors, createFinish, createFinishes, createSize, createSizes, createTag, deleteCategory, deleteColor, deleteFinish, deleteSize, deleteTag, updateCategory, updateColor, updateFinish, updateSize, updateTag } from '../functions';

export const createRecordForTableName = async (fastify: FastifyInstance, connection: any, data: any) => {
    let result: { code: number, message: string } | undefined;
    switch (data.tableName) {
        case 'categories':
            let mainCategoryId = null;
            if (data.mainSideNavId) {
                const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.mainSideNavId]);
                if (categories && categories.length > 0) mainCategoryId = categories[0].id;
            }

            result = await createCategory(fastify, {
                name: data.name,
                description: data.name,
                mainCategoryId,
            });
            break;
        case 'colors':
            if (data.mainSideNavId) result = await createColor(fastify, {
                name: data.name,
                value: data.name,
            });
            break;
        case 'finishes':
            if (data.mainSideNavId) result = await createFinish(fastify, {
                name: data.name,
                value: data.name,
            });
            break;
        case 'sizes':
            if (data.mainSideNavId) result = await createSize(fastify, {
                name: data.name.replaceAll(' ', ''),
                value: data.name,
            });
            break;
        case 'tags':
            let mainTagId = null;
            if (data.mainSideNavId) {
                const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.mainSideNavId]);
                if (tags && tags.length > 0) mainTagId = tags[0].id;
            }

            result = await createTag(fastify, {
                name: data.name,
                value: data.name,
                mainTagId,
            });
            break;
    }
    return result;
}

export const updateRecordForTableName = async (fastify: FastifyInstance, connection: any, data: any) => {
    let result: { code: number, message: string } | undefined;
    switch (data.tableName) {
        case 'categories':
            const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            const [mainCategories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE mainSideNavId=?)', [data.mainSideNavId || null]);
            if (categories && categories.length > 0) result = await updateCategory(fastify, {
                id: categories[0].id,
                name: data.name,
                description: data.name,
                mainCategoryId: mainCategories && mainCategories.length > 0 ? mainCategories[0].id : null,
            });
            break;
        case 'colors':
            const [colors] = await connection.query('SELECT id FROM colors WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (colors && colors.length > 0) result = await updateColor(fastify, {
                id: colors[0].id,
                name: data.name,
                value: data.name,
            });
            break;
        case 'finishes':
            const [finishes] = await connection.query('SELECT id FROM finishes WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (finishes && finishes.length > 0) result = await updateFinish(fastify, {
                id: finishes[0].id,
                name: data.name,
                value: data.name,
            });
            break;
        case 'sizes':
            const [sizes] = await connection.query('SELECT id FROM sizes WHERE value IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (sizes && sizes.length > 0) result = await updateSize(fastify, {
                id: sizes[0].id,
                name: data.name.replaceAll(' ', ''),
                value: data.name,
            });
            break;
        case 'tags':
            const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            const [mainTags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE mainSideNavId=?)', [data.mainSideNavId || null]);
            if (tags && tags.length > 0) result = await updateTag(fastify, {
                id: tags[0].id,
                name: data.name,
                value: data.name,
                mainTagId: mainTags && mainTags.length > 0 ? mainTags[0].id : null,
            });
            break;
    }
    return result;
}

export const addSubRecordForTableName = async (fastify: FastifyInstance, connection: any, data: any) => {
    let result: { code: number, message: string } | undefined;
    switch (data.tableName) {
        case 'categories':
            const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (categories && categories.length > 0) {
                const subCategories = data.subSideNavs && data.subSideNavs.length > 0
                    ? data.subSideNavs.map((x: any) => {
                        return {
                            name: x.name,
                            description: x.name,
                        }
                    })
                    : [];
                result = await addSubCategories(fastify, {
                    mainCategoryId: categories[0].id,
                    subCategories,
                });
            }
            break;
        case 'colors':
            const colors = data.subSideNavs && data.subSideNavs.length > 0
                ? data.subSideNavs.map((x: any) => {
                    return {
                        name: x.name,
                        value: x.name,
                    }
                })
                : [];
            result = await createColors(fastify, { colors });
            break;
        case 'finishes':
            const finishes = data.subSideNavs && data.subSideNavs.length > 0
                ? data.subSideNavs.map((x: any) => {
                    return {
                        name: x.name,
                        value: x.name,
                    }
                })
                : [];
            result = await createFinishes(fastify, { finishes });
            break;
        case 'sizes':
            const sizes = data.subSideNavs && data.subSideNavs.length > 0
                ? data.subSideNavs.map((x: any) => {
                    return {
                        name: x.name.replaceAll(' ', ''),
                        value: x.name,
                    }
                })
                : [];
            result = await createSizes(fastify, { sizes });
            break;
        case 'tags':
            const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (tags && tags.length > 0) {
                const subTags = data.subSideNavs && data.subSideNavs.length > 0
                    ? data.subSideNavs.map((x: any) => {
                        return {
                            name: x.name,
                            value: x.name,
                        }
                    })
                    : [];
                result = await addSubTags(fastify, {
                    mainTagId: tags[0].id,
                    subTags,
                });
            }
            break;
    }
    return result;
}

export const removeRecordForTableName = async (fastify: FastifyInstance, connection: any, data: any) => {
    let result: { code: number, message: string } | undefined;
    switch (data.tableName) {
        case 'categories':
            const [categories] = await connection.query('SELECT id FROM categories WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (categories && categories.length > 0) result = await deleteCategory(fastify, categories[0].id);
            break;
        case 'colors':
            const [colors] = await connection.query('SELECT id FROM colors WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (colors && colors.length > 0) result = await deleteColor(fastify, colors[0].id);
            break;
        case 'finishes':
            const [finishes] = await connection.query('SELECT id FROM finishes WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (finishes && finishes.length > 0) result = await deleteFinish(fastify, finishes[0].id);
            break;
        case 'sizes':
            const [sizes] = await connection.query('SELECT id FROM sizes WHERE value IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (sizes && sizes.length > 0) result = await deleteSize(fastify, sizes[0].id);
            break;
        case 'tags':
            const [tags] = await connection.query('SELECT id FROM tags WHERE name IN (SELECT name FROM productsSideNavs WHERE id=?)', [data.id]);
            if (tags && tags.length > 0) result = await deleteTag(fastify, tags[0].id);
            break;
    }
    return result;
}
