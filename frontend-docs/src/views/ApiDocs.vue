<template>
  <div class="api-docs">
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="main-header">
        <div class="header-left">
          <el-button
            v-if="!isMobile"
            type="text"
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <el-icon v-if="isCollapse"><Expand /></el-icon>
            <el-icon v-else><Fold /></el-icon>
          </el-button>
          <h1 class="header-title">API 文档中心</h1>
        </div>
        <div class="header-right">
          <el-button type="primary" plain>
            <el-icon><Document /></el-icon>
            <span>导出文档</span>
          </el-button>
        </div>
      </el-header>

      <el-container class="content-container">
        <!-- 移动端遮罩层 -->
        <div 
          v-if="isMobile && !isCollapse" 
          class="mobile-overlay"
          @click="toggleCollapse"
        ></div>

        <!-- 侧边栏 -->
        <el-aside 
          :width="isCollapse ? '0' : '280px'" 
          class="sidebar-container"
          :class="{ 'mobile-sidebar': isMobile }"
        >
          <div class="api-sidebar">
            <div class="search-wrapper" v-show="!isCollapse">
              <el-input
                v-model="searchQuery"
                placeholder="搜索 API..."
                prefix-icon="Search"
                clearable
                class="search-input"
              />
              <el-button
                v-if="isMobile"
                type="text"
                class="mobile-collapse-btn"
                @click="toggleCollapse"
              >
                <el-icon><Fold /></el-icon>
              </el-button>
            </div>
            <div class="api-groups">
              <div
                v-for="(group, groupName) in filteredGroups"
                :key="groupName"
                class="api-group"
              >
                <div class="group-header" @click="toggleGroup(groupName)">
                  <div class="group-title">
                    <el-icon class="group-icon"><Folder /></el-icon>
                    <span v-show="!isCollapse">{{ groupName }}</span>
                  </div>
                  <el-icon v-show="!isCollapse" :class="{ 'is-active': expandedGroups[groupName] }">
                    <ArrowDown />
                  </el-icon>
                </div>
                <transition name="slide-fade">
                  <div v-show="expandedGroups[groupName] && !isCollapse" class="group-routes">
                    <div
                      v-for="api in group.routes"
                      :key="`${groupName}-${api.path}`"
                      class="api-route"
                      :class="{ 'is-active': isActiveApi(groupName, api.path) }"
                      @click="selectApi(groupName, api)"
                    >
                      <span class="route-path">{{ api.path }}</span>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </el-aside>

        <!-- 移动端收起状态下的菜单按钮 -->
        <div v-if="isMobile && isCollapse" class="mobile-menu-btn" @click="toggleCollapse">
          <el-icon><Expand /></el-icon>
        </div>

        <!-- 主内容区 -->
        <el-main class="main-content" :class="{ 'mobile-content': isMobile && isCollapse }">
          <div v-if="selectedApi" class="api-detail">
            <div class="detail-header">
              <div class="api-title">
                <h1>{{ selectedApi.path }}</h1>
                <el-tag :type="getMethodType(selectedApi.method)" class="method-tag">
                  {{ selectedApi.method }}
                </el-tag>
              </div>
              <div class="api-meta">
                <div class="meta-item">
                  <el-icon><Folder /></el-icon>
                  <span>{{ selectedGroup }}</span>
                </div>
                <div class="meta-item prefix">
                  <el-icon><Connection /></el-icon>
                  <span>前缀：</span>
                  <span class="prefix-value">{{ apiGroups[selectedGroup]?.prefix || ' ' }}</span>
                </div>
                <div class="meta-item url">
                  <el-icon><Link /></el-icon>
                  <span>完整地址：</span>
                  <el-tooltip
                    :content="getFullPath(selectedApi)"
                    placement="top"
                    :show-after="500"
                  >
                    <span class="url-value">{{ getFullPath(selectedApi) }}</span>
                  </el-tooltip>
                  <el-button
                    type="primary"
                    link
                    @click="copyFullPath"
                  >
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            
            <div class="detail-content">
              <div class="content-section">
                <h3>请求参数</h3>
                <template v-if="hasParams(selectedApi)">
                  <div v-if="selectedApi.params.query" class="params-section">
                    <div class="section-header">
                      <el-icon><Document /></el-icon>
                      <span>Query 参数</span>
                    </div>
                    <el-table :data="formatParams(selectedApi.params.query)" border class="params-table">
                      <el-table-column prop="name" label="参数名" min-width="180" />
                      <el-table-column prop="required" label="是否必须" width="100" align="center">
                        <template #default="{ row }">
                          <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                            {{ row.required ? '必填' : '选填' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div v-if="selectedApi.params.requestBody" class="params-section">
                    <div class="section-header">
                      <el-icon><Document /></el-icon>
                      <span>请求体参数</span>
                    </div>
                    <el-table :data="formatParams(selectedApi.params.requestBody)" border class="params-table">
                      <el-table-column prop="name" label="参数名" min-width="180" />
                      <el-table-column prop="required" label="是否必须" width="100" align="center">
                        <template #default="{ row }">
                          <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                            {{ row.required ? '必填' : '选填' }}
                          </el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </template>
                <el-empty v-else description="无请求参数" />
              </div>
            </div>
          </div>
          <div v-else class="api-placeholder">
            <el-empty description="请选择要查看的 API" />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Folder,
  ArrowDown,
  Link,
  Document,
  Search,
  Expand,
  Fold,
  Connection,
  CopyDocument
} from '@element-plus/icons-vue'

const apiGroups = ref({})
const searchQuery = ref('')
const expandedGroups = ref({})
const selectedApi = ref(null)
const selectedGroup = ref('')
const isMobile = ref(false)
const isCollapse = ref(false)

const filteredGroups = computed(() => {
  if (!searchQuery.value) return apiGroups.value

  const query = searchQuery.value.toLowerCase()
  const filtered = {}

  Object.entries(apiGroups.value).forEach(([groupName, group]) => {
    const filteredRoutes = group.routes.filter(route => 
      route.path.toLowerCase().includes(query)
    )

    if (filteredRoutes.length > 0) {
      filtered[groupName] = {
        ...group,
        routes: filteredRoutes
      }
    }
  })

  return filtered
})

const getMethodType = (method) => {
  const types = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return types[method] || 'info'
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleGroup = (groupName) => {
  expandedGroups.value[groupName] = !expandedGroups.value[groupName]
}

const isActiveApi = (groupName, path) => {
  return selectedApi.value && selectedGroup.value === groupName && selectedApi.value.path === path
}

const selectApi = (groupName, api) => {
  selectedApi.value = api
  selectedGroup.value = groupName
}

const getFullPath = (api) => {
  const group = Object.entries(apiGroups.value).find(([_, g]) => 
    g.routes.some(route => route.path === api.path)
  )
  if (group) {
    return `${group[1].prefix}${api.path}`
  }
  return api.path
}

const copyFullPath = async () => {
  try {
    await navigator.clipboard.writeText(getFullPath(selectedApi.value))
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const hasParams = (api) => {
  return api.params && (
    (api.params.query && (api.params.query.required || api.params.query.optional)) ||
    (api.params.requestBody && api.params.requestBody.required)
  )
}

const formatParams = (params) => {
  const result = []
  if (params.required) {
    params.required.forEach(name => {
      result.push({ name, required: true })
    })
  }
  if (params.optional) {
    params.optional.forEach(name => {
      result.push({ name, required: false })
    })
  }
  return result
}

const fetchApiList = async () => {
  try {
    const response = await fetch('/api-list')
    const data = await response.json()
    apiGroups.value = data
    
    const firstGroup = Object.keys(data)[0]
    if (firstGroup) {
      expandedGroups.value[firstGroup] = true
      if (data[firstGroup].routes.length > 0) {
        selectApi(firstGroup, data[firstGroup].routes[0])
      }
    }
  } catch (error) {
    ElMessage.error('获取 API 列表失败')
    console.error('Error fetching API list:', error)
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  // 移动端默认收起，PC端默认展开
  isCollapse.value = isMobile.value
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchApiList()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
.api-docs {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  
  .main-container {
    height: 100%;
  }

  .main-header {
    background-color: white;
    border-bottom: 1px solid $border-lighter;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-xl;
    height: 60px;

    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-base;

      .collapse-btn {
        padding: 8px;
        font-size: 20px;
        border-radius: $border-radius-base;
        transition: all 0.3s;
        color: $text-primary;
        
        &:hover {
          color: $primary-color;
          background-color: $bg-light;
        }
        
        &:active {
          transform: scale(0.95);
        }
        
        .el-icon {
          font-size: 22px;
        }
      }

      .header-title {
        margin: 0;
        font-size: $font-size-xl;
        font-weight: 600;
        color: $text-primary;
        background: linear-gradient(45deg, $primary-color, lighten($primary-color, 20%));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .header-right {
      display: flex;
      gap: $spacing-base;
    }
  }

  .content-container {
    height: calc(100vh - 60px);
  }
  
  .sidebar-container {
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    background-color: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  }
  
  .api-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .search-wrapper {
      padding: $spacing-base;
      border-bottom: 1px solid $border-lighter;
      background-color: white;
      display: flex;
      align-items: center;
      gap: $spacing-base;
      
      .search-input {
        flex: 1;
        transition: all 0.3s;
        
        &:focus-within {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
      }
      
      .mobile-collapse-btn {
        padding: 8px;
        color: $text-primary;
        
        &:hover {
          color: $primary-color;
          background-color: $bg-light;
        }
        
        .el-icon {
          font-size: 20px;
        }
      }
    }
    
    .api-groups {
      flex: 1;
      overflow-y: auto;
      padding: $spacing-base;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }
      
      .api-group {
        margin-bottom: $spacing-base;
        
        .group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: $spacing-small;
          cursor: pointer;
          border-radius: $border-radius-base;
          transition: all 0.3s;
          
          &:hover {
            background-color: $bg-light;
            transform: translateX(4px);
          }
          
          .group-title {
            display: flex;
            align-items: center;
            gap: $spacing-small;
            color: $text-primary;
            font-weight: 500;
            
            .group-icon {
              color: $primary-color;
            }
          }
          
          .el-icon {
            transition: transform 0.3s;
            
            &.is-active {
              transform: rotate(180deg);
            }
          }
        }
        
        .group-routes {
          margin-top: $spacing-small;
          margin-left: $spacing-base;
          
          .api-route {
            padding: $spacing-small;
            margin-bottom: $spacing-mini;
            border-radius: $border-radius-base;
            cursor: pointer;
            transition: all 0.3s;
            color: $text-regular;
            font-size: $font-size-small;
            
            &:hover {
              background-color: $bg-light;
              transform: translateX(4px);
            }
            
            &.is-active {
              background-color: rgba($primary-color, 0.1);
              color: $primary-color;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
  
  .main-content {
    padding: $spacing-xl;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
    
    .api-detail {
      animation: fadeIn 0.3s ease-out;
      
      .detail-header {
        margin-bottom: $spacing-xl;
        background-color: white;
        border-radius: $border-radius-large;
        padding: $spacing-xl;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        
        .api-title {
          display: flex;
          align-items: center;
          gap: $spacing-base;
          margin-bottom: $spacing-base;
          
          h1 {
            margin: 0;
            color: $text-primary;
            font-size: $font-size-xl;
            font-weight: 600;
          }
        }
        
        .api-meta {
          display: flex;
          flex-direction: column;
          gap: $spacing-base;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: $spacing-small;
            color: $text-secondary;
            
            &.prefix, &.url {
              background-color: $bg-light;
              padding: $spacing-small $spacing-base;
              border-radius: $border-radius-base;
              transition: all 0.3s;
              
              &:hover {
                background-color: darken($bg-light, 2%);
              }
              
              .prefix-value, .url-value {
                font-family: monospace;
                color: $text-primary;
                word-break: break-all;
              }
            }
            
            .el-icon {
              font-size: $font-size-base;
              color: $primary-color;
            }
          }
        }
      }
      
      .detail-content {
        background-color: white;
        border-radius: $border-radius-large;
        padding: $spacing-xl;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        
        .content-section {
          h3 {
            margin: 0 0 $spacing-base;
            color: $text-primary;
            font-size: $font-size-large;
            font-weight: 500;
          }
          
          .params-section {
            margin-bottom: $spacing-xl;
            
            .section-header {
              display: flex;
              align-items: center;
              gap: $spacing-small;
              margin-bottom: $spacing-base;
              color: $text-regular;
              
              .el-icon {
                color: $primary-color;
              }
            }
            
            .params-table {
              margin-top: $spacing-base;
              transition: all 0.3s;
              
              &:hover {
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
              }
            }
          }
        }
      }
    }
    
    .api-placeholder {
      height: 100%;
      @extend .flex-center;
    }
  }
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

:deep(.el-table) {
  --el-table-border-color: $border-lighter;
  --el-table-header-bg-color: $bg-light;
  
  th {
    font-weight: 500;
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease-out;
}

.mobile-menu-btn {
  position: fixed;
  left: 16px;
  top: 10px;
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: $border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s;
  animation: slideIn 0.3s ease-out;
  
  .el-icon {
    font-size: 20px;
    color: $text-primary;
  }
  
  &:hover {
    background-color: $bg-light;
    .el-icon {
      color: $primary-color;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.mobile-content {
  padding-left: 80px;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  
  &.is-collapse {
    transform: translateX(-100%);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media screen and (max-width: 768px) {
  .api-docs {
    .main-header {
      .header-left {
        .header-title {
          margin-left: 56px;
          font-size: $font-size-large;
        }
        
        .collapse-btn {
          display: none;
        }
      }
      
      .header-right {
        .el-button {
          padding: 8px;
          
          span {
            display: none;
          }
        }
      }
    }

    .main-content {
      margin-left: 0;
      padding: $spacing-base;
    }

    .api-detail {
      .detail-header {
        padding: $spacing-base;
        
        .api-title {
          h1 {
            font-size: $font-size-large;
          }
        }
        
        .api-meta {
          .meta-item {
            &.prefix, &.url {
              padding: $spacing-mini $spacing-small;
              font-size: $font-size-small;
            }
          }
        }
      }
      
      .detail-content {
        padding: $spacing-base;
      }
    }
  }
}
</style> 